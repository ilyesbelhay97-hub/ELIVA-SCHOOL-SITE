import { NextResponse } from "next/server";
import { getLmsContext } from "@/lib/lms";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const context = await getLmsContext();
  if (!context.user || !context.role || context.role === "admin") return NextResponse.json({ error: "Accès requis." }, { status: 401 });
  const lessonId = new URL(request.url).searchParams.get("lessonId") ?? "";
  const lesson = await context.supabase.from("lms_lessons").select("video_asset_id,module_id,published").eq("id", lessonId).eq("published", true).maybeSingle();
  if (!lesson.data?.video_asset_id) return NextResponse.json({ error: "Vidéo introuvable." }, { status: 404 });
  const moduleRow = await context.supabase.from("lms_modules").select("course_id").eq("id", lesson.data.module_id).maybeSingle();
  if (!moduleRow.data) return NextResponse.json({ error: "Vidéo non autorisée." }, { status: 403 });
  const signed = await createServiceClient().storage.from("lms-videos").createSignedUrl(lesson.data.video_asset_id, 300);
  if (signed.error || !signed.data?.signedUrl) return NextResponse.json({ error: "Vidéo indisponible." }, { status: 503 });
  return NextResponse.json({ signed_url: signed.data.signedUrl });
}
