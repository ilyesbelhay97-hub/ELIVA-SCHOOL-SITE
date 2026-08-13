import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsCourse } from "@/lib/cms";
import { isLocale, localizedCourse, t } from "@/lib/i18n";
import { LocaleNavbar } from "@/components/i18n/locale-navbar";
import { LocaleFooter } from "@/components/i18n/locale-footer";
import { LocalizedRegistrationForm } from "@/components/i18n/localized-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params; if (!isLocale(locale)) return {};
  const result = await getCmsCourse(slug).catch(() => ({ data: null })); const course = result.data; const fallback = localizedCourse[slug]?.[locale]; if (!course && !fallback) return {};
  const title = course ? (locale === "ar" ? course.seo_title_ar || course.title_ar : course.seo_title_fr || course.title_fr) : fallback.title; const description = course ? (locale === "ar" ? course.seo_description_ar || course.short_description_ar : course.seo_description_fr || course.short_description_fr) : fallback.promise;
  return { title: title + " | ELIVA SCHOOL", description, alternates: { canonical: "/" + locale + "/formations/" + slug, languages: { fr: "/fr/formations/" + slug, ar: "/ar/formations/" + slug } }, openGraph: { title, description, images: course?.cover_image_path ? [course.cover_image_path] : undefined } };
}

type ModuleItem = { title?: string; description?: string };

export default async function LocalizedCourse({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params; if (!isLocale(locale)) notFound();
  const result = await getCmsCourse(slug).catch(() => ({ data: null })); const cms = result.data; const fallback = localizedCourse[slug]?.[locale]; if (!cms && !fallback) notFound();
  const title = cms ? (locale === "ar" ? cms.title_ar : cms.title_fr) : fallback.title; const promise = cms ? (locale === "ar" ? cms.short_description_ar : cms.short_description_fr) || "" : fallback.promise; const image = cms?.cover_image_path || (slug === "formation-de-formateurs-tot" ? "/images/courses/tot.webp" : slug === "agent-de-voyage" ? "/images/courses/agent-voyage.webp" : slug === "photographie" ? "/images/courses/photographie.webp" : slug === "educatrice-enfants-gerante-creche" ? "/images/courses/petite-enfance.webp" : "/images/courses/ecommerce-digital-marketing.webp"); const rawModules: unknown[] = cms ? (locale === "ar" ? cms.modules_ar : cms.modules_fr) : []; const modules: ModuleItem[] = rawModules.filter((item): item is ModuleItem => typeof item === "object" && item !== null);
  const s = t[locale]; const benefits = cms ? [] : fallback.benefits;
  const fallbackModules: ModuleItem[] = [1, 2, 3, 4, 5].map((_, i) => ({ title: (locale === "fr" ? "Module " : "الوحدة ") + (i + 1), description: locale === "fr" ? "Contenu structuré, exercices et accompagnement selon le parcours." : "محتوى منظم وتمارين ومرافقة حسب المسار." }));
  const renderedModules = modules.length ? modules : fallbackModules;
  return <main><LocaleNavbar locale={locale} path={"/" + locale + "/formations/" + slug} /><section className="bg-ink py-20 text-white"><div className="section-shell grid gap-10 lg:grid-cols-2 lg:items-center"><div><p className="eyebrow text-gold">{cms ? (locale === "ar" ? "دورة مهنية" : "Formation professionnelle") : fallback.category}</p><h1 className="mt-5 text-5xl font-semibold leading-none sm:text-7xl">{title}</h1><p className="mt-6 text-lg leading-8 text-white/70">{promise}</p><div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full border border-white/20 px-4 py-2">{s.presentiel}</span><span className="rounded-full border border-white/20 px-4 py-2">{cms?.trainers_crm?.full_name || ""}</span></div><a href={"/" + locale + "/inscription?formation=" + slug} className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-semibold text-ink">{s.register} ↗</a></div><div className="relative aspect-[16/10] overflow-hidden rounded-3xl"><img src={image} alt={title} className="h-full w-full object-cover" /></div></div></section><section className="section-shell grid gap-12 py-20 lg:grid-cols-[1.1fr_.9fr]"><div><h2 className="text-4xl font-semibold">{s.learn}</h2><div className="mt-8 grid gap-3 sm:grid-cols-2">{benefits.map((item: string) => <div key={item} className="rounded-2xl bg-sand p-5">{item}</div>)}</div><h2 className="mt-16 text-4xl font-semibold">{s.program}</h2><div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">{renderedModules.map((module: ModuleItem, index: number) => <details key={index} className="py-5"><summary className="cursor-pointer font-semibold">{module.title}</summary><p className="mt-3 text-sm leading-6 text-ink/60">{module.description}</p></details>)}</div></div><LocalizedRegistrationForm locale={locale} courseSlug={slug} /></section><LocaleFooter locale={locale} /></main>;
}
