import Link from "next/link";

export function StickyRegistrationCta({ courseSlug, label = "S’inscrire maintenant" }: { courseSlug: string; label?: string }) {
  return <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden"><Link className="flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-white" href={`/inscription?formation=${courseSlug}`}>{label} <span className="ml-2" aria-hidden>↗</span></Link></div>;
}
