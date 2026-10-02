import Link from "next/link";
import { requireLmsRole, localizedValue } from "@/lib/lms";

type TrainerModule = { id: string; title_fr: string | null; title_ar: string | null; display_order: number; published: boolean };
type TrainerLesson = { id: string; module_id: string; title_fr: string | null; title_ar: string | null; published: boolean; video_provider: string | null };

export default async function TrainerCoursePage({ params }: { params: Promise<{ locale: string; courseId: string }> }) {
  const { locale: rawLocale, courseId } = await params; const locale = rawLocale === "ar" ? "ar" : "fr"; const ar = locale === "ar"; const { supabase } = await requireLmsRole("trainer", locale);
  const { data: course } = await supabase.from("courses").select("id,title,excerpt").eq("id", courseId).maybeSingle();
  const { data: modules } = await supabase.from("lms_modules").select("id,title_fr,title_ar,display_order,published").eq("course_id", courseId).order("display_order");
  const trainerModules = (modules ?? []) as unknown as TrainerModule[];
  const ids = trainerModules.map((module) => module.id);
  const { data: lessonData } = ids.length ? await supabase.from("lms_lessons").select("id,module_id,title_fr,title_ar,published,video_provider").in("module_id", ids).order("display_order") : { data: [] };
  const trainerLessons = (lessonData ?? []) as unknown as TrainerLesson[];
  if (!course) return <main className="section-shell py-20">{ar ? "الدورة غير موجودة." : "Formation introuvable."}</main>;
  return <main dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-background"><header className="bg-ink px-5 py-5 text-white"><div className="mx-auto flex max-w-6xl justify-between"><Link href={`/${locale}/trainer`} className="text-sm text-white/70">← {ar ? "دوراتي" : "Mes formations"}</Link><span className="font-semibold tracking-[0.08em]">Meritify <span className="text-gold">ACADEMY</span></span></div></header><section className="mx-auto max-w-5xl px-5 py-12"><p className="eyebrow text-gold-dark">{ar ? "إدارة المحتوى" : "Gestion du contenu"}</p><h1 className="mt-3 text-4xl font-semibold">{course.title}</h1><p className="mt-4 text-ink/60">{ar ? "يمكنك إدارة الوحدات والدروس المسموح بها من هنا." : "Gérez les modules et leçons autorisés depuis cet espace."}</p><div className="mt-8 grid gap-4">{trainerModules.map((module) => <section key={module.id} className="rounded-3xl border border-ink/10 bg-white p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{localizedValue(locale, module.title_fr, module.title_ar)}</h2><span className="text-xs text-gold-dark">{module.published ? "published" : "draft"}</span></div><div className="mt-4 grid gap-2">{trainerLessons.filter((lesson) => lesson.module_id === module.id).map((lesson) => <div key={lesson.id} className="rounded-xl border border-ink/10 p-3 text-sm"><span className="font-semibold">{localizedValue(locale, lesson.title_fr, lesson.title_ar)}</span><span className="mx-2 text-ink/40">·</span>{lesson.video_provider ?? (ar ? "درس نصي" : "Leçon texte")}</div>)}</div></section>)}</div></section></main>;
}
