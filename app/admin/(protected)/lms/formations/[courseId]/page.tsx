import { requireAdmin } from "@/lib/supabase/admin";
import LmsCourseManager from "@/components/admin/lms-course-manager";

type AdminModule = { id: string; course_id: string; title_fr: string | null; title_ar: string | null; description_fr: string | null; description_ar: string | null; display_order: number; published: boolean };
type AdminLesson = { id: string; module_id: string; title_fr: string | null; title_ar: string | null; description_fr: string | null; description_ar: string | null; lesson_type: string | null; video_provider: string | null; video_asset_id: string | null; video_playback_id: string | null; video_url: string | null; duration_seconds: number | null; display_order: number; published: boolean };

export const dynamic = "force-dynamic";

export default async function AdminLmsCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const { supabase } = await requireAdmin();
  const { data: course } = await supabase.from("courses").select("id,title,slug,excerpt,description,cover_url,format,status,trainer_id").eq("id", courseId).maybeSingle();
  if (!course) return <section className="py-16"><p>Formation introuvable.</p></section>;
  const [{ data: modules }, { data: lives }, { data: enrollments }] = await Promise.all([
    supabase.from("lms_modules").select("id,course_id,title_fr,title_ar,description_fr,description_ar,display_order,published").eq("course_id", courseId).order("display_order"),
    supabase.from("lms_live_sessions").select("id,course_id,session_id,title_fr,title_ar,provider,join_url,starts_at,ends_at,status").eq("course_id", courseId).order("starts_at"),
    supabase.from("lms_enrollments").select("id,user_id,status,access_starts_at,access_ends_at,created_at").eq("course_id", courseId).order("created_at", { ascending: false }),
  ]);
  const adminModules = (modules ?? []) as unknown as AdminModule[];
  const ids = adminModules.map((module) => module.id);
  const { data: lessonData } = ids.length ? await supabase.from("lms_lessons").select("id,module_id,title_fr,title_ar,description_fr,description_ar,lesson_type,video_provider,video_asset_id,video_playback_id,video_url,duration_seconds,display_order,published").in("module_id", ids).order("display_order") : { data: [] };
  const adminLessons = (lessonData ?? []) as unknown as AdminLesson[];
  return <LmsCourseManager course={course} modules={adminModules} lessons={adminLessons} lives={lives ?? []} enrollments={enrollments ?? []} />;
}
