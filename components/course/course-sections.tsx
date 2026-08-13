import type { CourseDetail } from "@/lib/courses";
import { SectionHeading } from "@/components/ui/section-heading";

export function CourseSections({ course, compact = false }: { course: CourseDetail; compact?: boolean }) {
  return (
    <>
      <section className={`${compact ? "py-12 sm:py-16" : "py-20 sm:py-28"} section-shell`}>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="Pour qui ?" title="Un parcours pensé pour votre prochaine étape." />
          <div className="grid gap-3 sm:grid-cols-2">{course.audience.map((item, index) => <div key={item} className="rounded-2xl border border-ink/10 bg-white p-5"><span className="font-mono text-xs text-gold-dark">0{index + 1}</span><p className="mt-8 font-semibold leading-6">{item}</p></div>)}</div>
        </div>
      </section>
      <section className="border-y border-ink/10 bg-sand py-20 sm:py-28">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="Ce que vous allez apprendre" title="Des notions à transformer en réflexes." />
          <div className="grid gap-3 sm:grid-cols-2">{course.topics.map((topic) => <div key={topic} className="flex gap-3 rounded-2xl border border-ink/10 bg-background p-5 text-sm font-semibold leading-6"><span className="text-gold-dark" aria-hidden>✦</span><span>{topic}</span></div>)}</div>
        </div>
      </section>
      <section className={`${compact ? "py-12 sm:py-16" : "py-20 sm:py-28"} section-shell`}>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="Programme" title="Un chemin lisible, module après module." />
          <div className="divide-y divide-ink/10 border-y border-ink/10">{course.modules.map((module, index) => <details key={module.title} className="group py-5"><summary className="flex cursor-pointer list-none items-center gap-5 font-semibold tracking-tight [&::-webkit-details-marker]:hidden"><span className="font-mono text-xs text-gold-dark">0{index + 1}</span><span className="flex-1">{module.title}</span><span className="text-2xl font-light text-ink/40 transition group-open:rotate-45">+</span></summary><p className="pl-10 pt-3 text-sm leading-6 text-ink/60">{module.description}</p></details>)}</div>
        </div>
      </section>
      {course.addedValue && <section className="border-y border-ink/10 bg-ink py-20 text-white sm:py-28"><div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><SectionHeading dark eyebrow="Ce qui accompagne le parcours" title="Un cadre pour continuer à pratiquer." /><div className="grid gap-3 sm:grid-cols-2">{course.addedValue.map((item) => <div key={item} className="rounded-2xl border border-white/15 p-5 font-semibold text-white/80">{item}</div>)}</div></div></section>}
      <section className={`${compact ? "py-12 sm:py-16" : "py-20 sm:py-28"} section-shell`}>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><SectionHeading eyebrow="Questions fréquentes" title="Avant de commencer." /><div className="divide-y divide-ink/10 border-y border-ink/10">{course.faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold tracking-tight [&::-webkit-details-marker]:hidden">{faq.question}<span className="text-2xl font-light text-ink/40 transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-ink/60">{faq.answer}</p></details>)}</div></div>
      </section>
    </>
  );
}
