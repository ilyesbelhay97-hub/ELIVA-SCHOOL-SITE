import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";

export const metadata: Metadata = { title: "Demande préparée | ELIVA SCHOOL", description: "Confirmation de démonstration du parcours d’inscription ELIVA SCHOOL." };

export default function RegistrationThankYouPage() {
  return <main><Navbar solid /><section className="grid min-h-[60vh] place-items-center bg-ink px-6 py-24 text-center text-white"><div className="max-w-2xl"><p className="eyebrow mb-5 text-gold">Mode démonstration</p><h1 className="text-5xl font-semibold leading-none tracking-[-0.06em] sm:text-7xl">Votre demande est prête à être confirmée.</h1><p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/65">Cette page ne confirme pas encore une inscription réelle et aucune donnée n’a été enregistrée. Elle prépare le parcours qui sera relié au système ELIVA SCHOOL ultérieurement.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-6 text-sm font-semibold text-white" href="/formations">Revoir les formations ↗</Link><Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white" href="/">Retour à l’accueil</Link></div></div></section><Footer /></main>;
}
