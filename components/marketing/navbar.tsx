import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return <header className="absolute inset-x-0 top-0 z-20 text-white">
    <div className="section-shell flex h-20 items-center justify-between">
      <a href="#top" className="relative h-12 w-32 overflow-hidden rounded-lg bg-white" aria-label="ELIVA SCHOOL, accueil"><Image src="/eliva-logo.png" alt="ELIVA SCHOOL" fill sizes="128px" className="object-cover" priority /></a>
      <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex" aria-label="Navigation principale">
        <a href="#formations" className="transition hover:text-white">Formations</a><a href="#domaines" className="transition hover:text-white">Domaines</a><a href="#entreprises" className="transition hover:text-white">Entreprises</a><a href="#a-propos" className="transition hover:text-white">À propos</a><a href="#faq" className="transition hover:text-white">FAQ</a>
      </nav>
      <div className="hidden lg:block"><Button href="#formations">Voir les formations</Button></div>
      <details className="relative lg:hidden"><summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-white/20 text-xl [&::-webkit-details-marker]:hidden" aria-label="Ouvrir le menu">☰</summary><nav className="absolute right-0 top-14 w-60 rounded-2xl border border-ink/10 bg-white p-3 text-ink shadow-2xl" aria-label="Navigation mobile"><a className="block rounded-xl p-3 hover:bg-sand" href="#formations">Formations</a><a className="block rounded-xl p-3 hover:bg-sand" href="#domaines">Domaines</a><a className="block rounded-xl p-3 hover:bg-sand" href="#entreprises">Entreprises</a><a className="block rounded-xl p-3 hover:bg-sand" href="#a-propos">À propos</a><a className="mt-2 block rounded-xl bg-ink p-3 font-semibold text-white" href="#formations">Voir les formations ↗</a></nav></details>
    </div>
  </header>;
}
