import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-background px-6 text-center"><div><p className="eyebrow mb-5 text-gold-dark">404 — Profil introuvable</p><h1 className="text-4xl font-semibold tracking-[-0.05em]">Ce profil n’existe pas.</h1><Link className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white" href="/formateurs">Voir tous les formateurs ↗</Link></div></main>;
}
