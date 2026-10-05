import { NextResponse } from "next/server";
import { getLmsContext } from "@/lib/lms";
import { createServiceClient } from "@/lib/supabase/service";
import { isSameOrigin } from "@/lib/security/request";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  const context = await getLmsContext(); if (!context.user || context.role !== "trainer" || !context.profile?.trainer_id) return NextResponse.json({ error: "Accès formateur requis." }, { status: 403 });
  const form = await request.formData(); const file = form.get("file"); const lessonId = String(form.get("lesson_id") ?? "");
  if (!(file instanceof File) || !lessonId) return NextResponse.json({ error: "Leçon et vidéo obligatoires." }, { status: 400 });
  if (file.size > 500 * 1024 * 1024 || !["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) return NextResponse.json({ error: "Vidéo MP4, WebM ou MOV de 500 Mo maximum." }, { status: 400 });
  const lesson = await context.supabase.from("lms_lessons").select("id,module_id").eq("id", lessonId).maybeSingle(); if (!lesson.data) return NextResponse.json({ error: "Leçon non autorisée." }, { status: 403 });
  const moduleRow = await context.supabase.from("lms_modules").select("id,course_id").eq("id", lesson.data.module_id).maybeSingle(); if (!moduleRow.data) return NextResponse.json({ error: "Module non autorisé." }, { status: 403 });
  const path = `trainers/${context.profile.trainer_id}/courses/${moduleRow.data.course_id}/lessons/${lessonId}/${crypto.randomUUID()}`; const service = createServiceClient(); const upload = await service.storage.from("lms-videos").upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) return NextResponse.json({ error: "Upload vidéo impossible." }, { status: 500 });
  const update = await service.from("lms_lessons").update({ video_provider: "supabase", video_asset_id: path }).eq("id", lessonId);
  if (update.error) { await service.storage.from("lms-videos").remove([path]); return NextResponse.json({ error: "Enregistrement vidéo impossible." }, { status: 500 }); }
  return NextResponse.json({ ok: true, path });
}

export async function GET(request: Request) {
  const context = await getLmsContext();
  if (!context.user || context.role !== "trainer" || !context.profile?.trainer_id) return NextResponse.json({ error: "Accès formateur requis." }, { status: 403 });
  const lessonId = new URL(request.url).searchParams.get("lessonId") ?? "";
  const lesson = await context.supabase.from("lms_lessons").select("video_asset_id,module_id").eq("id", lessonId).maybeSingle();
  if (!lesson.data?.video_asset_id) return NextResponse.json({ error: "Vidéo introuvable." }, { status: 404 });
  const moduleRow = await context.supabase.from("lms_modules").select("course_id").eq("id", lesson.data.module_id).maybeSingle();
  if (!moduleRow.data) return NextResponse.json({ error: "Vidéo non autorisée." }, { status: 403 });
  const signed = await createServiceClient().storage.from("lms-videos").createSignedUrl(lesson.data.video_asset_id, 300);
  if (signed.error || !signed.data?.signedUrl) return NextResponse.json({ error: "Vidéo indisponible." }, { status: 503 });
  return NextResponse.json({ signed_url: signed.data.signedUrl });
}
