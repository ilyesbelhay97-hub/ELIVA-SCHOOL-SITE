"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar({ solid = false }: { solid?: boolean }) {
  const headerClass = solid ? "relative z-20 border-b border-ink/10 bg-background text-ink" : "absolute inset-x-0 top-0 z-20 text-white";
  const navText = solid ? "text-ink/60 hover:text-ink" : "text-white/70 hover:text-white";

  return (
    <header className={headerClass}>
      <div className="section-shell flex h-20 items-center justify-between">
        <Link href="/" className="relative h-12 w-32 overflow-hidden rounded-lg bg-white" aria-label="ELIVA SCHOOL, accueil">
          <Image src="/eliva-logo.png" alt="ELIVA SCHOOL" fill sizes="128px" className="object-cover" priority />
        </Link>
        <nav className="hidden items-center gap-8 text-sm lg:flex" aria-label="Navigation principale">
          <Link href="/formations" className={`transition ${navText}`}>Formations</Link>
          <Link href="/#domaines" className={`transition ${navText}`}>Domaines</Link>
          <Link href="/#entreprises" className={`transition ${navText}`}>Entreprises</Link>
          <Link href="/#a-propos" className={`transition ${navText}`}>À propos</Link>
          <Link href="/formateurs" className={`transition ${navText}`}>Formateurs</Link>
          <details className="relative"><summary className={`cursor-pointer list-none transition ${navText}`}>Rejoignez-nous</summary><div className="absolute left-0 top-8 w-52 rounded-2xl border border-ink/10 bg-white p-2 text-ink shadow-xl"><Link href="/rejoignez-nous/formateur" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")} className="block rounded-xl p-3 hover:bg-sand">Devenir formateur</Link></div></details>
        </nav>
        <div className="hidden lg:block"><Button href="/formations">Voir les formations</Button></div>
        <details className="relative lg:hidden">
          <summary className={`flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border text-xl [&::-webkit-details-marker]:hidden ${solid ? "border-ink/20" : "border-white/20"}`} aria-label="Ouvrir le menu">☰</summary>
          <nav className="absolute right-0 top-14 w-60 rounded-2xl border border-ink/10 bg-white p-3 text-ink shadow-2xl" aria-label="Navigation mobile">
            <Link className="block rounded-xl p-3 hover:bg-sand" href="/formations">Formations</Link>
            <Link className="block rounded-xl p-3 hover:bg-sand" href="/#domaines">Domaines</Link>
            <Link className="block rounded-xl p-3 hover:bg-sand" href="/#entreprises">Entreprises</Link>
            <Link className="block rounded-xl p-3 hover:bg-sand" href="/formateurs">Formateurs</Link>
            <Link className="block rounded-xl p-3 hover:bg-sand" href="/rejoignez-nous/formateur" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>Rejoignez-nous comme formateur</Link>
            <Link className="mt-2 block rounded-xl bg-ink p-3 font-semibold text-white" href="/formations">Voir les formations ↗</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
