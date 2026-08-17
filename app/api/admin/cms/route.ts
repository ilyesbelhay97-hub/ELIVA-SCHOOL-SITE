import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { isSameOrigin } from "@/lib/security/request";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
const uuid = (value: unknown) => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value) ? value : "";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Origine de requête non autorisée." }, 403);
  try {
    await requireAdmin();
    const body = await request.json() as { action?: string; id?: unknown; status?: unknown; is_public?: unknown };
    const id = uuid(body.id);
    if (!id) return json({ error: "Identifiant invalide." }, 400);
    const service = createServiceClient();
    const update = (table: string, values: Record<string, unknown>) =>
      (service.from(table) as unknown as { update: (input: Record<string, unknown>) => { eq: (column: string, value: string) => Promise<{ error: unknown }> } })
        .update(values)
        .eq("id", id);
    if (body.action === "course_status" && ["draft", "published", "archived"].includes(String(body.status))) {
      const status = String(body.status);
      const { error } = await update("courses", { publish_status: status, published_at: status === "published" ? new Date().toISOString() : null });
      if (error) return json({ error: "Impossible de modifier la publication de la formation." }, 400);
      return json({ ok: true });
    }
    if (body.action === "trainer_status" && typeof body.is_public === "boolean") {
      const isPublic = body.is_public;
      const { error } = await update("trainers_crm", { is_public: isPublic, public_published_at: isPublic ? new Date().toISOString() : null });
      if (error) return json({ error: "Impossible de modifier la publication du formateur." }, 400);
      return json({ ok: true });
    }
    return json({ error: "Action CMS invalide." }, 400);
  } catch {
    return json({ error: "Accès admin requis." }, 401);
  }
}
