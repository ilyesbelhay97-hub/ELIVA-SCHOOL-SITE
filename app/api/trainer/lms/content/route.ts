import { NextResponse } from "next/server";
import { getLmsContext } from "@/lib/lms";
import { isSameOrigin } from "@/lib/security/request";

type ContentType = "module" | "lesson" | "live";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clean = (value: unknown) => String(value ?? "").trim();
const message = (error = "Impossible d’enregistrer le contenu.", status = 400) => NextResponse.json({ error }, { status });

async function trainerContext() {
  const context = await getLmsContext();
  if (!context.user || context.role !== "trainer" || !context.profile?.trainer_id) return null;
  return context;
}

function payload(type: ContentType, body: Record<string, unknown>) {
  if (type === "module") return {
    course_id: clean(body.course_id), title_fr: clean(body.title_fr) || null, title_ar: clean(body.title_ar) || null,
    description_fr: clean(body.description_fr) || null, description_ar: clean(body.description_ar) || null,
    display_order: Number(body.display_order ?? 0), published: Boolean(body.published),
  };
  if (type === "lesson") return {
    module_id: clean(body.module_id), title_fr: clean(body.title_fr) || null, title_ar: clean(body.title_ar) || null,
    description_fr: clean(body.description_fr) || null, description_ar: clean(body.description_ar) || null,
    lesson_type: ["video", "text", "resource"].includes(clean(body.lesson_type)) ? clean(body.lesson_type) : "text",
    video_provider: clean(body.video_provider) || null, video_url: clean(body.video_url) || null,
    duration_seconds: body.duration_seconds === "" || body.duration_seconds == null ? null : Number(body.duration_seconds),
    display_order: Number(body.display_order ?? 0), published: Boolean(body.published),
  };
  return {
    course_id: clean(body.course_id), title_fr: clean(body.title_fr) || null, title_ar: clean(body.title_ar) || null,
    provider: ["google_meet", "zoom", "other"].includes(clean(body.provider)) ? clean(body.provider) : "other",
    join_url: clean(body.join_url), starts_at: body.starts_at, ends_at: body.ends_at || null,
    status: ["scheduled", "completed", "cancelled"].includes(clean(body.status)) ? clean(body.status) : "scheduled",
  };
}

function table(type: ContentType) { return type === "module" ? "lms_modules" : type === "lesson" ? "lms_lessons" : "lms_live_sessions"; }

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return message("Origine non autorisée.", 403);
  const context = await trainerContext(); if (!context) return message("Accès formateur requis.", 403);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const type = body?.type as ContentType; if (!body || !["module", "lesson", "live"].includes(type)) return message("Type de contenu invalide.");
  const data = payload(type, body) as Record<string, unknown>;
  if (type === "module" && !uuid.test(String(data.course_id))) return message("Formation invalide.");
  if (type === "lesson" && !uuid.test(String(data.module_id))) return message("Module invalide.");
  if (type === "live" && (!uuid.test(String(data.course_id)) || !data.join_url || !data.starts_at)) return message("Les informations de session sont incomplètes.");
  const result = await context.supabase.from(table(type)).insert(data).select().single();
  if (result.error) return message("Action refusée ou contenu invalide.", 403);
  return NextResponse.json({ item: result.data });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return message("Origine non autorisée.", 403);
  const context = await trainerContext(); if (!context) return message("Accès formateur requis.", 403);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const type = body?.type as ContentType; const id = clean(body?.id);
  if (!body || !id || !uuid.test(id) || !["module", "lesson", "live"].includes(type)) return message("Contenu invalide.");
  const data = payload(type, body) as Record<string, unknown>;
  const result = await context.supabase.from(table(type)).update(data).eq("id", id).select().single();
  if (result.error) return message("Action refusée ou contenu invalide.", 403);
  return NextResponse.json({ item: result.data });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return message("Origine non autorisée.", 403);
  const context = await trainerContext(); if (!context) return message("Accès formateur requis.", 403);
  const body = await request.json().catch(() => null) as { type?: ContentType; id?: string } | null;
  if (!body?.id || !uuid.test(body.id) || !body.type || !["module", "lesson", "live"].includes(body.type)) return message("Contenu invalide.");
  const result = await context.supabase.from(table(body.type)).delete().eq("id", body.id);
  if (result.error) return message("Suppression refusée. Dépubliez le contenu si une dépendance existe.", 403);
  return NextResponse.json({ ok: true });
}
