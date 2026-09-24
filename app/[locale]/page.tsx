import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Locale, isLocale, localizedCourse, t } from "@/lib/i18n";
import { LocaleNavbar } from "@/components/i18n/locale-navbar";
import { LocaleFooter } from "@/components/i18n/locale-footer";
import { LocalizedCourseCard } from "@/components/i18n/localized-course-card";
import { LocalizedTrainersSection } from "@/components/i18n/localized-trainers-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: t[locale].homeTitle + " | Meritify Academy", description: t[locale].homeLead, alternates: { canonical: "/" + locale, languages: { fr: "/fr", ar: "/ar" } } };
}

function Hero({ locale, s }: { locale: Locale; s: typeof t[Locale] }) {
  return <section className="premium-grain relative overflow-hidden bg-ink py-16 text-white sm:py-24 lg:py-32">
    <div className="premium-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
    <div className="pointer-events-none absolute -end-28 -top-28 size-80 rounded-full border border-gold/20 sm:size-[30rem]" />
    <div className="pointer-events-none absolute end-[8%] top-24 size-28 rounded-full bg-gold/15 blur-3xl sm:size-48" aria-hidden />
    <div className="pointer-events-none absolute bottom-0 start-[48%] h-px w-2/3 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    <div className="pointer-events-none absolute end-[12%] top-1/2 hidden size-4 -translate-y-1/2 rotate-45 border border-gold/70 lg:block" />
    <div className="section-shell relative">
      <p className="eyebrow motion-reveal relative text-gold">{s.homeEyebrow}</p>
      <div className="relative mt-7 grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div>
          <h1 className="motion-reveal max-w-5xl text-[clamp(3rem,9vw,7.1rem)] font-semibold leading-[.95] tracking-[-.065em]">{s.homeTitle}</h1>
          <p className="motion-reveal mt-8 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">{s.homeLead}</p>
          <div className="motion-reveal mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={"/" + locale + "/formations"} className="group inline-flex min-h-13 items-center justify-center rounded-full bg-gold px-7 font-semibold text-ink hover:bg-white">{s.discover}<span className="ms-3 transition-transform group-hover:translate-x-1">↗</span></Link>
            <Link href={"/" + locale + "/inscription"} className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 px-7 font-semibold text-white hover:border-gold hover:text-gold">{s.register}</Link>
          </div>
          <Link href={"/" + locale + "/rejoignez-nous/formateur"} className="mt-5 inline-flex text-sm text-white/55 underline decoration-gold/60 underline-offset-8 hover:text-white">{s.navJoinLink} ↗</Link>
        </div>
        <div className="hidden justify-end lg:flex"><div className="max-w-xs border-s border-gold/50 ps-6 text-sm leading-7 text-white/55"><span className="mb-8 block text-5xl font-light text-gold">M</span><p>{locale === "fr" ? "Un cadre exigeant pour apprendre, pratiquer et construire la suite." : "إطار طموح للتعلم والتطبيق وبناء الخطوة القادمة."}</p><div className="gold-rule mt-8 w-24" /></div></div>
      </div>
    </div>
  </section>;
}

export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const s = t[locale];
  const slugs = Object.keys(localizedCourse);
  return <main><LocaleNavbar locale={locale} path={"/" + locale} /><Hero locale={locale} s={s} />
    <section className="border-b border-ink/10 bg-background"><div className="section-shell grid divide-y divide-ink/10 py-2 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">{s.trust.map((item, i) => <div key={item} className="motion-reveal flex items-center gap-4 py-5 sm:px-6 lg:py-7"><span className="text-sm font-semibold text-gold-dark">0{i + 1}</span><span className="text-sm font-medium">{item}</span></div>)}</div></section>
    <section className="section-shell py-20 sm:py-28"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow text-gold-dark">{s.coursesEyebrow}</p><h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{s.coursesTitle}</h2><p className="mt-5 max-w-2xl text-ink/60">{s.coursesLead}</p></div><Link href={`/${locale}/formations`} className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline decoration-gold underline-offset-8 hover:text-gold-dark">{s.navCta} <span className="ms-2" aria-hidden>↗</span></Link></div><div className="mt-10 grid gap-5 lg:grid-cols-3">{slugs.map((slug, index) => <div key={slug} className={`motion-reveal motion-reveal-delay-${Math.min(index + 1, 3)}`}><LocalizedCourseCard slug={slug} locale={locale} /></div>)}</div></section>
    <section className="overflow-hidden bg-sand py-20 sm:py-28"><div className="section-shell grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-end"><p className="eyebrow text-gold-dark">{s.editorialLabel}</p><div><h2 className="max-w-5xl text-4xl font-semibold leading-[1.05] tracking-[-.05em] sm:text-6xl lg:text-7xl">{s.editorialTitle}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-ink/60">{s.editorialBody}</p></div></div><div className="section-shell mt-14 h-px bg-ink/15" /></section>
    <LocalizedTrainersSection locale={locale} />
    <section className="section-shell py-20 sm:py-28"><p className="eyebrow text-gold-dark">{s.methodologyLabel}</p><h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{s.methodologyTitle}</h2><div className="mt-12 grid gap-4 md:grid-cols-3">{s.methodology.map((item, i) => <article key={item.title} className="group border-t border-ink/20 pt-5 transition-colors hover:border-gold"><span className="text-sm font-semibold text-gold-dark">0{i + 1}</span><h3 className="mt-10 text-2xl font-semibold">{item.title}</h3><p className="mt-4 leading-7 text-ink/60">{item.body}</p></article>)}</div></section>
    <section className="relative overflow-hidden bg-ink py-20 text-white sm:py-28"><div className="pointer-events-none absolute end-12 top-10 size-32 rotate-45 border border-gold/30" /><div className="section-shell relative flex flex-col justify-between gap-9 lg:flex-row lg:items-end"><div><p className="eyebrow text-gold">{s.finalTitle}</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-.05em] sm:text-6xl">{s.finalBody}</h2></div><div className="flex flex-col gap-3 sm:flex-row"><Link href={"/" + locale + "/formations"} className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-6 font-semibold text-ink hover:bg-white">{s.navCta} ↗</Link><Link href={"/" + locale + "/contact"} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 font-semibold text-white hover:border-gold hover:text-gold">{s.contactCta}</Link></div></div></section>
    <LocaleFooter locale={locale} />
  </main>;
}

