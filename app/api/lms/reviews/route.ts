import { NextResponse } from "next/server";
import { getLmsContext } from "@/lib/lms";
import { isSameOrigin } from "@/lib/security/request";

export async function GET(request: Request) {
  const context = await getLmsContext(); const courseId = new URL(request.url).searchParams.get("courseId");
  if (!context.user || context.role !== "student" || !courseId) return NextResponse.json({ error: "Accès étudiant requis." }, { status: 403 });
  const result = await context.supabase.from("trainer_reviews").select("id,rating,comment,status,created_at").eq("student_user_id", context.user.id).eq("course_id", courseId).maybeSingle();
  return result.error ? NextResponse.json({ error: "Avis indisponible." }, { status: 500 }) : NextResponse.json({ review: result.data });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  const context = await getLmsContext();
  if (!context.user || context.role !== "student") return NextResponse.json({ error: "Accès étudiant requis." }, { status: 403 });
  const body = await request.json().catch(() => null) as { courseId?: string; rating?: number; comment?: string } | null;
  if (!body?.courseId || !Number.isInteger(body.rating) || (body.rating as number) < 1 || (body.rating as number) > 5) return NextResponse.json({ error: "La note doit être comprise entre 1 et 5." }, { status: 400 });
  const enrollment = await context.supabase.from("lms_enrollments").select("id,status").eq("user_id", context.user.id).eq("course_id", body.courseId).in("status", ["active", "completed"]).maybeSingle();
  if (!enrollment.data) return NextResponse.json({ error: "Vous devez être inscrit à cette formation." }, { status: 403 });
  const course = await context.supabase.from("courses").select("trainer_id").eq("id", body.courseId).maybeSingle();
  if (!course.data?.trainer_id) return NextResponse.json({ error: "Cette formation n’a pas encore de formateur." }, { status: 400 });
  const result = await context.supabase.from("trainer_reviews").insert({ trainer_id: course.data.trainer_id, student_user_id: context.user.id, course_id: body.courseId, enrollment_id: enrollment.data.id, rating: body.rating, comment: body.comment?.trim().slice(0, 2000) || null }).select("id,rating,comment,status,created_at").single();
  if (result.error) return NextResponse.json({ error: result.error.code === "23505" ? "Vous avez déjà envoyé un avis pour cette formation." : "Impossible d’enregistrer votre avis." }, { status: result.error.code === "23505" ? 409 : 500 });
  return NextResponse.json({ review: result.data, message: "Merci pour votre avis." });
}
