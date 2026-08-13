import Link from "next/link";
import Image from "next/image";
import { type Locale, localizedCourse, t } from "@/lib/i18n";
import type { CmsCourse } from "@/lib/cms";

export function LocalizedCourseCard({ slug, locale, cmsCourse }: { slug: string; locale: Locale; cmsCourse?: CmsCourse }) {
  const staticCourse = localizedCourse[slug]?.[locale];
  if (!staticCourse && !cmsCourse) return null;
  const course = cmsCourse ? { title: locale === "ar" ? cmsCourse.title_ar : cmsCourse.title_fr, category: locale === "ar" ? "دورات مهنية" : "Formation professionnelle", promise: (locale === "ar" ? cmsCourse.short_description_ar : cmsCourse.short_description_fr) ?? "", benefits: [], image: cmsCourse.cover_image_path } : { title: staticCourse.title, category: staticCourse.category, promise: staticCourse.promise, benefits: staticCourse.benefits, image: undefined };
  const image = course.image ?? (slug === "formation-de-formateurs-tot" ? "/images/courses/tot.webp" : slug === "agent-de-voyage" ? "/images/courses/agent-voyage.webp" : slug === "photographie" ? "/images/courses/photographie.webp" : slug === "educatrice-enfants-gerante-creche" ? "/images/courses/petite-enfance.webp" : "/images/courses/ecommerce-digital-marketing.webp");
  const trainer = cmsCourse?.trainers_crm?.full_name ?? ({ "formation-de-formateurs-tot": "Djebbour Mohamed", "agent-de-voyage": "Amina Mghizili", photographie: "Toufik Derdour", "educatrice-enfants-gerante-creche": "Safa Belkharchouche", "ecommerce-marketing-digital": "Ilyes Belhay" }[slug] ?? "");
  return <article className="overflow-hidden rounded-3xl border border-ink/10 bg-white"><div className="relative aspect-[16/10]"><Image src={image} alt={course.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div><div className="p-6"><p className="eyebrow text-gold-dark">{course.category}</p><h2 className="mt-3 text-2xl font-semibold tracking-tight">{course.title}</h2><p className="mt-3 text-sm leading-6 text-ink/60">{course.promise}</p><p className="mt-4 text-sm font-semibold">{t[locale].trainer}: {trainer}</p><div className="mt-5 flex flex-wrap gap-2">{course.benefits.map(benefit => <span key={benefit} className="rounded-full bg-sand px-3 py-2 text-xs">{benefit}</span>)}</div><Link href={"/" + locale + "/formations/" + slug} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white">{t[locale].viewCourse} ↗</Link></div></article>;
}
