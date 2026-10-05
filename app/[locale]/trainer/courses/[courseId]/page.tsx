import { requireLmsRole } from "@/lib/lms";
import TrainerCourseWorkspace from "@/components/lms/trainer-course-workspace";

export const dynamic = "force-dynamic";
export default async function TrainerCoursePage({ params }: { params: Promise<{ locale: string; courseId: string }> }) {
  const { locale: rawLocale, courseId } = await params; const locale = rawLocale === "ar" ? "ar" : "fr"; const { supabase } = await requireLmsRole("trainer", locale);
  const { data: course } = await supabase.from("courses").select("id,title,excerpt,cover_url,status").eq("id", courseId).maybeSingle(); if (!course) return <main className="section-shell py-20">{locale === "ar" ? "الدورة غير موجودة." : "Formation introuvable."}</main>;
  const { data: modules } = await supabase.from("lms_modules").select("id,course_id,title_fr,title_ar,description_fr,description_ar,display_order,published").eq("course_id", courseId).order("display_order"); const rows = modules ?? []; const moduleIds = rows.map((item) => item.id);
  const [{ data: lessons }, { data: lives }, { data: resources }] = await Promise.all([moduleIds.length ? supabase.from("lms_lessons").select("id,module_id,title_fr,title_ar,lesson_type,video_provider,video_url,display_order,published").in("module_id", moduleIds).order("display_order") : Promise.resolve({ data: [] }), supabase.from("lms_live_sessions").select("id,title_fr,title_ar,provider,join_url,starts_at,ends_at,status").eq("course_id", courseId).order("starts_at"), supabase.from("lms_resources").select("id,lesson_id,title_fr,title_ar,mime_type,published").eq("course_id", courseId).order("created_at")]);
  return <TrainerCourseWorkspace locale={locale} course={course} modules={rows} lessons={lessons ?? []} lives={lives ?? []} resources={resources ?? []}/>;
}
