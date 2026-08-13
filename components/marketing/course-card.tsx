import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/lib/content";
import { Button } from "@/components/ui/button";

const tones = { gold: "bg-gold", blue: "bg-[#d7e3ee]", orange: "bg-[#ead7bb]" };

export function CourseCard({ course }: { course: Course }) {
  const href = course.slug ? `/formations/${course.slug}` : "#faq";
  return <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5">
    <div className={`${course.coverImage ? "" : tones[course.tone]} relative aspect-[16/9] overflow-hidden`}>
      {course.coverImage ? <Image src={course.coverImage} alt={course.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <><span className="eyebrow absolute left-5 top-5 text-ink/60">{course.category}</span><span className="absolute -bottom-8 -right-3 text-[10rem] font-semibold leading-none tracking-[-0.12em] text-ink/10">EL</span></>}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 pt-14"><span className="eyebrow text-white/80">{course.category}</span></div>
    </div>
    <div className="p-6">
      <h3 className="text-2xl font-semibold leading-tight tracking-[-0.04em]">{course.title}</h3>
      <p className="mt-3 min-h-12 text-sm leading-6 text-ink/60">{course.excerpt}</p>
      {course.trainerName && <p className="mt-4 text-sm font-semibold text-ink">Avec <Link className="text-gold-dark hover:text-ink" href={`/formateurs/${course.trainerSlug}`}>{course.trainerName}</Link></p>}
      {course.benefits?.length ? <ul className="mt-4 grid gap-2 border-t border-ink/10 pt-4 text-sm text-ink/70">{course.benefits.slice(0, 3).map((benefit) => <li key={benefit}>✦ {benefit}</li>)}</ul> : null}
      <div className="mt-5 grid gap-2 border-t border-ink/10 pt-5 text-xs text-ink/60 sm:grid-cols-2"><span>↗ {course.duration}</span><span>▣ {course.format}</span></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"><Button className="w-full" href={href} variant="dark">Voir la formation <span aria-hidden>↗</span></Button><Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink transition hover:border-gold hover:bg-gold/10" href={`/inscription?formation=${course.slug}`}>S’inscrire</Link></div>
    </div>
  </article>;
}
