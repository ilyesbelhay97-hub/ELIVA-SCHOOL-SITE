import { Button } from "@/components/ui/button";

export function Hero() {
  return <section id="top" className="relative isolate min-h-[680px] overflow-hidden bg-ink text-white sm:min-h-[760px]">
    <div className="absolute inset-0 opacity-60" aria-hidden><div className="absolute -right-32 top-0 h-[620px] w-[620px] rounded-full border-[1px] border-gold/35 sm:h-[800px] sm:w-[800px]" /><div className="absolute -right-8 top-28 h-[470px] w-[470px] rounded-full border border-gold/20 sm:h-[620px] sm:w-[620px]" /><div className="absolute right-24 top-64 h-32 w-32 rounded-full bg-gold/30 blur-3xl" /></div>
    <div className="section-shell relative flex min-h-[680px] items-end pb-16 pt-32 sm:min-h-[760px] sm:pb-24">
      <div className="max-w-4xl"><p className="eyebrow mb-7 text-gold">ELIVA SCHOOL / apprendre autrement</p><h1 className="max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.07em] sm:text-7xl lg:text-[7.5rem]">Les compétences qui créent de vraies <span className="text-gold">opportunités.</span></h1><div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center"><p className="max-w-md text-base leading-7 text-white/60">Des formations pratiques, des formateurs de terrain et un accompagnement conçu pour passer de la théorie à l’action.</p><div className="flex shrink-0 gap-3"><Button href="#formations">Découvrir les formations <span aria-hidden>↗</span></Button><a href="mailto:bonjour@eliva.school" className="hidden items-center px-3 text-sm font-medium text-white/70 transition hover:text-white sm:inline-flex">Parler à un conseiller <span className="ml-2 text-gold">↗</span></a></div></div></div>
    </div>
    <div className="absolute bottom-6 right-6 hidden max-w-[210px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:block"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">Learning in motion</p><p className="mt-3 text-sm leading-5 text-white/70">Un cadre pour tester, progresser et repartir confiant.</p></div>
  </section>;
}
