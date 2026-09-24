import Image from "next/image";
import Link from "next/link";
import { type Locale, t } from "@/lib/i18n";
import { trainers } from "@/lib/trainers";

export function LocalizedTrainersSection({ locale }: { locale: Locale }) {
  const s = t[locale];
  const isArabic = locale === "ar";
  const arabicRoles: Record<string, string> = {
    "djebbour-mohamed": "مدرب دولي وخبير تجاري",
    "amina-mghizili": "إطار تسويق في الخطوط الجوية الجزائرية",
    "toufik-derdour": "مدرب دولي في التصوير",
    "safa-belkharchouche": "مدربة في مجال الطفولة المبكرة",
  };

  return (
    <section className="overflow-hidden bg-ink py-20 text-white sm:py-28" id="formateurs">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-gold">👥 {s.trainersEyebrow}</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-6xl">{s.trainersTitle}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">{s.trainersLead}</p>
          </div>
          <Link href={`/${locale}/formateurs`} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-semibold text-white hover:border-gold hover:text-gold">
            {s.viewProfile} <span className="ms-2 text-gold" aria-hidden>↗</span>
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.slice(0, 4).map((trainer) => (
            <article key={trainer.slug} className="group lift-on-hover overflow-hidden rounded-2xl border border-white/15 bg-white/[.06]">
              <Link href={`/${locale}/formateurs/${trainer.slug}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                  <Image src={trainer.image} alt={trainer.alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" className="object-cover object-[72%_center] transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" aria-hidden />
                  <span className="absolute bottom-4 start-4 rounded-full border border-white/20 bg-ink/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.12em] text-white/80">{isArabic ? "مدرب Meritify" : "Formateur Meritify"}</span>
                </div>
              </Link>
              <div className="p-5">
                <p className="eyebrow text-gold">{isArabic ? arabicRoles[trainer.slug] : trainer.role}</p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{trainer.name}</h3>
                <Link href={`/${locale}/formations/${trainer.course.slug}`} className="mt-5 inline-flex items-center text-sm font-semibold text-white/65 hover:text-gold">
                  {isArabic ? "اكتشف التكوين" : "Découvrir la formation"}<span className="ms-2 text-gold" aria-hidden>↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
