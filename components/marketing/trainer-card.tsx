import Image from "next/image";
import Link from "next/link";
import type { Trainer } from "@/lib/trainers";
import { Button } from "@/components/ui/button";

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink/25 hover:shadow-xl hover:shadow-ink/5">
      <Link href={`/formateurs/${trainer.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink">
          <Image
            src={trainer.image}
            alt={trainer.alt}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
            className="object-cover object-[72%_center] transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/80 to-transparent" aria-hidden />
          <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-ink/75 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80">
            Formateur ELIVA
          </span>
        </div>
      </Link>
      <div className="p-5 sm:p-6">
        <p className="eyebrow text-gold-dark">{trainer.role}</p>
        <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em]">{trainer.name}</h3>
        <p className="mt-3 text-sm leading-6 text-ink/60">{trainer.credibility}</p>
        <div className="mt-5 border-t border-ink/10 pt-4">
          <p className="text-xs uppercase tracking-[0.12em] text-ink/40">Formation animée</p>
          <Link href={`/formations/${trainer.course.slug}`} className="mt-2 block font-semibold leading-5 text-ink hover:text-gold-dark">
            {trainer.course.title} <span aria-hidden>↗</span>
          </Link>
        </div>
        <Button className="mt-5 w-full" href={`/formateurs/${trainer.slug}`} variant="dark">
          Voir le profil <span aria-hidden>↗</span>
        </Button>
      </div>
    </article>
  );
}
