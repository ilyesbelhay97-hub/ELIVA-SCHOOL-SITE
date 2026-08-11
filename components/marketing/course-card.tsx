import type { Course } from "@/lib/content";
import { Button } from "@/components/ui/button";

const tones = { gold: "bg-gold", blue: "bg-[#d7e3ee]", orange: "bg-[#ead7bb]" };

export function CourseCard({ course }: { course: Course }) {
  return <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5"><div className={`${tones[course.tone]} relative h-52 overflow-hidden p-5`}><span className="eyebrow text-ink/60">{course.category}</span><span className="absolute -bottom-8 -right-3 text-[10rem] font-semibold leading-none tracking-[-0.12em] text-ink/10">EL</span><span className="absolute bottom-5 left-5 rounded-full border border-ink/15 bg-white/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/70">Nouveau programme</span></div><div className="p-6"><h3 className="text-2xl font-semibold leading-tight tracking-[-0.04em]">{course.title}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-ink/60">{course.excerpt}</p><div className="mt-6 grid grid-cols-2 gap-y-3 border-t border-ink/10 pt-5 text-xs text-ink/60"><span>◌ {course.city}</span><span>◷ {course.date}</span><span>↗ {course.duration}</span><span>▣ {course.format}</span></div><Button className="mt-6 w-full" href="#faq" variant="dark">Voir le programme <span aria-hidden>↗</span></Button></div></article>;
}
