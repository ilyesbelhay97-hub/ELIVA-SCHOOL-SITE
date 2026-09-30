import { NextResponse } from "next/server";
import { getLmsContext } from "@/lib/lms";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const { supabase, user, role } = await getLmsContext(); if (!user || !role || role === "admin") return NextResponse.json({ error: "Accès requis." }, { status: 401 });
  const lessonId = new URL(request.url).searchParams.get("lessonId"); if (!lessonId) return NextResponse.json({ error: "lessonId requis." }, { status: 400 });
  const { data: resources, error } = await supabase.from("lms_resources").select("id, title_fr, title_ar, storage_path, mime_type, size_bytes, lesson_id, course_id").eq("lesson_id", lessonId);
  if (error) return NextResponse.json({ error: "Ressources indisponibles." }, { status: 500 });
  try { const service = createServiceClient(); const signed = await Promise.all((resources ?? []).map(async (resource: any) => { const result = await service.storage.from("lms-files").createSignedUrl(resource.storage_path, 300); return { ...resource, signed_url: result.data?.signedUrl ?? null }; })); return NextResponse.json({ resources: signed }); } catch { return NextResponse.json({ error: "Le stockage privé n’est pas configuré côté serveur." }, { status: 503 }); }
}
