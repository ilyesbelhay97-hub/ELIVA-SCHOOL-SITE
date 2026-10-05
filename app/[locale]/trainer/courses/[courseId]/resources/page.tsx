import Link from "next/link";
import { requireLmsRole } from "@/lib/lms";
import TrainerResourceUploader from "@/components/lms/trainer-resource-uploader";

export const dynamic = "force-dynamic";
export default async function TrainerResourcesPage({ params }: { params: Promise<{ locale: string; courseId: string }> }) {
  const { locale: rawLocale, courseId } = await params; const locale = rawLocale === "ar" ? "ar" : "fr"; const ar = locale === "ar"; const { supabase } = await requireLmsRole("trainer", locale);
  const { data: course } = await supabase.from("courses").select("id,title").eq("id", courseId).maybeSingle(); if (!course) return <main className="section-shell py-20">{ar ? "الدورة غير موجودة." : "Formation introuvable."}</main>;
  const { data: modules } = await supabase.from("lms_modules").select("id").eq("course_id", courseId); const ids = (modules ?? []).map((item) => item.id); const { data: lessons } = ids.length ? await supabase.from("lms_lessons").select("id,title_fr,title_ar").in("module_id", ids).order("display_order") : { data: [] };
  return <main dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-background"><section className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><Link href={`/${locale}/trainer/courses/${courseId}`} className="text-sm text-gold-dark">← {ar ? "مساحة الدورة" : "Workspace"}</Link><p className="eyebrow mt-8 text-gold-dark">LMS · {ar ? "موارد خاصة" : "Ressources privées"}</p><h1 className="mt-3 text-4xl font-semibold">{course.title}</h1><p className="mt-3 text-sm text-ink/60">{ar ? "الملفات تبقى خاصة وتخضع لصلاحية الدورة." : "Les fichiers restent privés et sont contrôlés par l’autorisation de la formation."}</p><TrainerResourceUploader locale={locale} courseId={courseId} lessons={lessons ?? []}/></section></main>;
}
