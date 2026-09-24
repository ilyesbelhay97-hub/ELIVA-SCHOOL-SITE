import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, t, type Locale } from "@/lib/i18n";
import { getCmsTrainers } from "@/lib/cms";
import { LocaleNavbar } from "@/components/i18n/locale-navbar";
import { LocaleFooter } from "@/components/i18n/locale-footer";
import { trainerImages } from "@/lib/trainer-images";

const fallback = [
  { slug: "djebbour-mohamed", name: "Djebbour Mohamed", role: { fr: "Formateur international & expert commercial", ar: "مدرب دولي وخبير في المجال التجاري" }, image: trainerImages["djebbour-mohamed"] },
  { slug: "amina-mghizili", name: "Amina Mghizili", role: { fr: "Cadre marketing chez Air Algérie", ar: "إطار في التسويق لدى الخطوط الجوية الجزائرية" }, image: trainerImages["amina-mghizili"] },
  { slug: "toufik-derdour", name: "Toufik Derdour", role: { fr: "Formateur international en photographie", ar: "مدرب دولي في التصوير الفوتوغرافي" }, image: trainerImages["toufik-derdour"] },
  { slug: "safa-belkharchouche", name: "Safa Belkharchouche", role: { fr: "Formatrice en petite enfance", ar: "مدربة في مجال الطفولة المبكرة" }, image: trainerImages["safa-belkharchouche"] },
  { slug: "ilyes-belhay", name: "Ilyes Belhay", role: { fr: "Formateur E-commerce & Marketing Digital", ar: "مدرب في التجارة الإلكترونية والتسويق الرقمي" }, image: trainerImages["ilyes-belhay"] },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; return { title: `${t[locale].navTrainers} | Meritify Academy`, description: t[locale].trainersLead }; }

export default async function LocalizedTrainers({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const s = t[locale];
  const result = await getCmsTrainers().catch(() => ({ data: null }));
  const people = result.data?.length ? result.data.map((row) => ({ slug: row.public_slug ?? row.id, name: row.full_name, role: locale === "ar" ? row.public_title_ar ?? "مدرب Meritify Academy" : row.public_title_fr ?? "Formateur Meritify Academy", image: row.public_photo_path ?? "" })) : fallback.map((person) => ({ ...person, role: person.role[locale as Locale] }));
  return <main dir={locale === "ar" ? "rtl" : "ltr"}><LocaleNavbar locale={locale} path={`/${locale}/formateurs`} /><section className="bg-ink py-24 text-white"><div className="section-shell"><p className="eyebrow text-gold">{s.trainersEyebrow}</p><h1 className="mt-5 max-w-4xl text-5xl font-semibold sm:text-7xl">{s.trainersTitle}</h1><p className="mt-6 max-w-2xl text-white/65">{s.trainersLead}</p></div></section><section className="section-shell grid gap-5 py-20 sm:grid-cols-2 lg:grid-cols-3">{people.map((person) => <article key={person.slug} className="overflow-hidden rounded-3xl border border-ink/10 bg-white"><div className="relative aspect-[4/5]">{person.image && <img src={person.image} alt={person.name} className="h-full w-full object-cover" />}</div><div className="p-6"><h2 className="text-2xl font-semibold">{person.name}</h2><p className="mt-2 text-sm text-gold-dark">{person.role}</p><a href={`/${locale}/formateurs/${person.slug}`} className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">{s.viewProfile} ↗</a></div></article>)}</section><LocaleFooter locale={locale} /></main>;
}
