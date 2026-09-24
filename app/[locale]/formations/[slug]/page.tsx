import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsCourse } from "@/lib/cms";
import { getDetailedCourseContent } from "@/lib/course-content";
import { courseImages, getCourseImage } from "@/lib/course-images";
import { isLocale, localizedCourse, t } from "@/lib/i18n";
import { CourseProgram } from "@/components/course/course-program";
import { LocaleFooter } from "@/components/i18n/locale-footer";
import { LocaleNavbar } from "@/components/i18n/locale-navbar";
import { LocalizedRegistrationForm } from "@/components/i18n/localized-form";
import { CourseViewTracker } from "@/components/analytics/course-view-tracker";

type ModuleItem = { title?: string; description?: string; lessons?: string[] };

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const result = await getCmsCourse(slug).catch(() => ({ data: null }));
  const course = result.data;
  const fallback = localizedCourse[slug]?.[locale];
  if (!course && !fallback) return {};
  const title = course ? (locale === "ar" ? course.seo_title_ar || course.title_ar : course.seo_title_fr || course.title_fr) : fallback.title;
  const description = course ? (locale === "ar" ? course.seo_description_ar || course.short_description_ar : course.seo_description_fr || course.short_description_fr) : fallback.promise;
  return { title: `${title} | Meritify Academy`, description, alternates: { canonical: `/${locale}/formations/${slug}`, languages: { fr: `/fr/formations/${slug}`, ar: `/ar/formations/${slug}` } }, openGraph: { title, description, images: [getCourseImage(slug, course?.cover_image_path) ?? "/images/courses/ecommerce-digital-marketing-meritify.png"] } };
}

export default async function LocalizedCourse({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const result = await getCmsCourse(slug).catch(() => ({ data: null }));
  const cms = result.data;
  const fallback = localizedCourse[slug]?.[locale];
  const detail = getDetailedCourseContent(slug, locale);
  if (!cms && !fallback) notFound();
  const rtl = locale === "ar";
  const strings = t[locale];
  const title = cms ? (rtl ? cms.title_ar : cms.title_fr) : fallback.title;
  const promise = cms ? (rtl ? cms.short_description_ar : cms.short_description_fr) || "" : fallback.promise;
  const image = getCourseImage(slug, cms?.cover_image_path) ?? courseImages[slug] ?? courseImages["ecommerce-marketing-digital"];
  const rawModules: unknown[] = cms ? (rtl ? cms.modules_ar : cms.modules_fr) : [];
  const cmsModules: ModuleItem[] = rawModules.filter((item): item is ModuleItem => typeof item === "object" && item !== null);
  const modules = cmsModules.length ? cmsModules.map((item) => ({ title: item.title ?? "Module", description: item.description ?? "", lessons: item.lessons ?? [] })) : detail?.modules ?? [];
  const trainerName = cms?.trainers_crm?.full_name || ({ "formation-de-formateurs-tot": "Djebbour Mohamed", "agent-de-voyage": "Amina Mghizili", photographie: "Toufik Derdour", "educatrice-enfants-gerante-creche": "Safa Belkharchouche", "ecommerce-marketing-digital": "Ilyes Belhay" } as Record<string, string>)[slug];
  const modeLabel = cms?.study_modes?.map((mode: string) => mode === "presentiel" ? strings.presentiel : mode === "online" ? strings.online : mode).join(" / ") || strings.presentiel;
  const nav = [{ id: "presentation", label: rtl ? "نظرة عامة" : "Aperçu" }, { id: "programme", label: rtl ? "البرنامج" : "Programme" }, { id: "competences", label: rtl ? "المهارات" : "Compétences" }, { id: "informations", label: rtl ? "معلومات" : "Informations" }, { id: "faq", label: rtl ? "الأسئلة" : "FAQ" }];

  return <main dir={rtl ? "rtl" : "ltr"}>
    <LocaleNavbar locale={locale} path={`/${locale}/formations/${slug}`} /><CourseViewTracker courseSlug={slug} courseName={title} locale={locale} />
    <section className="bg-ink py-20 text-white"><div className="section-shell grid gap-10 lg:grid-cols-2 lg:items-center"><div><p className="eyebrow text-gold">{cms ? (rtl ? "🎓 دورة مهنية" : "🎓 Formation professionnelle") : fallback.category}</p><h1 className="mt-5 text-5xl font-semibold leading-none sm:text-7xl">{title}</h1><p className="mt-6 text-lg leading-8 text-white/70">{promise}</p><div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-white/20 px-4 py-2">{modeLabel}</span>{trainerName && <span className="rounded-full border border-white/20 px-4 py-2">{trainerName}</span>}</div><a href={`/${locale}/inscription?formation=${slug}`} className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-semibold text-ink">{rtl ? "🚀 سجّل الآن" : "🚀 Je m’inscris"}</a></div><div className="relative aspect-[16/10] overflow-hidden rounded-3xl"><img src={image} alt={title} className="h-full w-full object-cover" /></div></div></section>
    <nav aria-label={rtl ? "تنقل الدورة" : "Navigation de la formation"} className="sticky top-0 z-20 border-b border-ink/10 bg-background/95 py-3 backdrop-blur"><div className="section-shell flex gap-4 overflow-x-auto text-sm font-semibold">{nav.map((item) => <a key={item.id} href={`#${item.id}`} className="whitespace-nowrap text-ink/65 hover:text-gold-dark">{item.label}</a>)}</div></nav>
    <section className="section-shell grid gap-12 py-20 lg:grid-cols-[1.1fr_.9fr]"><div>{detail ? <><section id="presentation"><h2 className="text-4xl font-semibold">{rtl ? "📖 عن التكوين" : "📖 Présentation"}</h2><p className="mt-6 text-lg leading-8 text-ink/65">{detail.presentation}</p></section><section id="objectifs" className="mt-16"><h2 className="text-4xl font-semibold">{rtl ? "🎯 أهداف الدورة" : "🎯 Objectifs"}</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{detail.objectives.map((item) => <div key={item} className="rounded-2xl bg-sand p-5">{item}</div>)}</div></section><section id="programme" className="mt-16"><h2 className="text-4xl font-semibold">{rtl ? "📚 البرنامج التدريبي" : "📚 Programme"}</h2><div className="mt-6"><CourseProgram modules={modules} rtl={rtl} /></div></section><section id="competences" className="mt-16"><h2 className="text-4xl font-semibold">{rtl ? "🏆 المهارات المكتسبة" : "🏆 Compétences acquises"}</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{detail.skills.map((item) => <div key={item} className="rounded-2xl border border-ink/10 p-5 font-semibold">{item}</div>)}</div><h3 className="mt-12 text-2xl font-semibold">{rtl ? "🛠️ منهجية التدريب" : "🛠️ Méthodologie"}</h3><div className="mt-5 grid gap-3 sm:grid-cols-2">{detail.methodology.map((item) => <div key={item} className="rounded-2xl bg-sand p-5">{item}</div>)}</div></section><section id="informations" className="mt-16"><h2 className="text-4xl font-semibold">{rtl ? "📍 معلومات الدورة" : "📍 Informations pratiques"}</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{detail.practicalInfo.map((item) => <div key={item} className="rounded-2xl border border-ink/10 p-5 font-semibold">{item}</div>)}</div></section><section id="faq" className="mt-16"><h2 className="text-4xl font-semibold">{rtl ? "❓ الأسئلة الشائعة" : "❓ Questions fréquentes"}</h2><div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">{detail.faqs.map((item) => <details key={item.question} className="py-5"><summary className="cursor-pointer font-semibold">{item.question}</summary><p className="mt-3 text-sm leading-7 text-ink/60">{item.answer}</p></details>)}</div></section></> : <><h2 className="text-4xl font-semibold">{strings.program}</h2><div className="mt-6"><CourseProgram modules={modules} rtl={rtl} /></div></>}</div><LocalizedRegistrationForm locale={locale} courseSlug={slug} /></section>
    <section className="bg-gold py-16"><div className="section-shell flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><h2 className="text-3xl font-semibold sm:text-4xl">{rtl ? "🚀 جاهز لتطوير مهاراتك؟" : "🚀 Prêt à développer vos compétences ?"}</h2><a href={`/${locale}/inscription?formation=${slug}`} className="rounded-full bg-ink px-6 py-3 font-semibold text-white">{rtl ? "أريد التسجيل ↗" : "Je m’inscris ↗"}</a></div></section>
    <LocaleFooter locale={locale} />
  </main>;
}
