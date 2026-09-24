import Link from "next/link";
import Image from "next/image";
import { type Locale, localizedCourse, t } from "@/lib/i18n";
import type { CmsCourse } from "@/lib/cms";
import { getCourseImage } from "@/lib/course-images";

export function LocalizedCourseCard({ slug, locale, cmsCourse }: { slug: string; locale: Locale; cmsCourse?: CmsCourse }) {
  const staticCourse = localizedCourse[slug]?.[locale];
  if (!staticCourse && !cmsCourse) return null;
  const course = cmsCourse ? { title: locale === "ar" ? cmsCourse.title_ar : cmsCourse.title_fr, category: locale === "ar" ? "دورات مهنية" : "Formation professionnelle", promise: (locale === "ar" ? cmsCourse.short_description_ar : cmsCourse.short_description_fr) ?? "", benefits: [], image: cmsCourse.cover_image_path } : { title: staticCourse.title, category: staticCourse.category, promise: staticCourse.promise, benefits: staticCourse.benefits, image: undefined };
  const image = getCourseImage(slug, course.image) ?? "/images/courses/ecommerce-digital-marketing-meritify.png";
  const trainer = cmsCourse?.trainers_crm?.full_name ?? ({ "formation-de-formateurs-tot": "Djebbour Mohamed", "agent-de-voyage": "Amina Mghizili", photographie: "Toufik Derdour", "educatrice-enfants-gerante-creche": "Safa Belkharchouche", "ecommerce-marketing-digital": "Ilyes Belhay" }[slug] ?? "");
  return <article className="group lift-on-hover overflow-hidden rounded-3xl border border-ink/10 bg-white"><div className="relative aspect-[16/10] overflow-hidden"><Image src={image} alt={course.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent opacity-70" /><span className="eyebrow absolute bottom-4 start-5 text-white/85">{course.category}</span></div><div className="p-6"><h2 className="text-2xl font-semibold leading-tight tracking-tight">{course.title}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-ink/60">{course.promise}</p><p className="mt-4 text-sm font-semibold">{t[locale].trainer}: <span className="text-gold-dark">{trainer}</span></p><div className="mt-5 flex min-h-9 flex-wrap gap-2">{course.benefits.slice(0, 3).map(benefit => <span key={benefit} className="rounded-full bg-sand px-3 py-2 text-xs">{benefit}</span>)}</div><Link href={"/" + locale + "/formations/" + slug} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink">{t[locale].viewCourse} <span className="ms-2" aria-hidden>↗</span></Link></div></article>;
}
