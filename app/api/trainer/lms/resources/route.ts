import { NextResponse } from "next/server";
import { getLmsContext } from "@/lib/lms";
import { createServiceClient } from "@/lib/supabase/service";
import { isSameOrigin } from "@/lib/security/request";

const allowed = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "image/jpeg", "image/png", "image/webp"]);
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  const context = await getLmsContext();
  if (!context.user || context.role !== "trainer" || !context.profile?.trainer_id) return NextResponse.json({ error: "Accès formateur requis." }, { status: 403 });
  const form = await request.formData(); const file = form.get("file"); const courseId = String(form.get("course_id") ?? "");
  if (!(file instanceof File) || !courseId || !String(form.get("title_fr") ?? "").trim() || !String(form.get("title_ar") ?? "").trim()) return NextResponse.json({ error: "Fichier, formation et titres obligatoires." }, { status: 400 });
  if (file.size > 50 * 1024 * 1024 || !allowed.has(file.type)) return NextResponse.json({ error: "Type ou taille de fichier non autorisé." }, { status: 400 });
  const owns = await context.supabase.from("courses").select("id").eq("id", courseId).eq("trainer_id", context.profile.trainer_id).maybeSingle();
  if (!owns.data) return NextResponse.json({ error: "Formation non autorisée." }, { status: 403 });
  const lessonId = String(form.get("lesson_id") ?? "") || null;
  if (lessonId) {
    const lesson = await context.supabase.from("lms_lessons").select("id,module_id").eq("id", lessonId).maybeSingle();
    if (!lesson.data) return NextResponse.json({ error: "Leçon non autorisée." }, { status: 403 });
    const moduleRow = await context.supabase.from("lms_modules").select("course_id").eq("id", lesson.data.module_id).maybeSingle();
    if (!moduleRow.data || moduleRow.data.course_id !== courseId) return NextResponse.json({ error: "La leçon n’appartient pas à cette formation." }, { status: 403 });
  }
  const path = `trainers/${context.profile.trainer_id}/courses/${courseId}/resources/${crypto.randomUUID()}`;
  const service = createServiceClient(); const upload = await service.storage.from("lms-files").upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) return NextResponse.json({ error: "Upload impossible." }, { status: 500 });
  const inserted = await service.from("lms_resources").insert({ course_id: courseId, lesson_id: lessonId, title_fr: String(form.get("title_fr")), title_ar: String(form.get("title_ar")), storage_path: path, mime_type: file.type, size_bytes: file.size, published: false, created_by: context.user.id }).select().single();
  if (inserted.error) { await service.storage.from("lms-files").remove([path]); return NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 }); }
  return NextResponse.json({ resource: inserted.data });
}
