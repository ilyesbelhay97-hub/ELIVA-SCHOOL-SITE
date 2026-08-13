import type { Metadata } from "next";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { TrainerCard } from "@/components/marketing/trainer-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { trainers } from "@/lib/trainers";

export const metadata: Metadata = {
  title: "Nos formateurs | ELIVA SCHOOL",
  description: "Découvrez les formateurs ELIVA SCHOOL : des professionnels de terrain en e-commerce, marketing digital, photographie, tourisme, petite enfance et pédagogie.",
};

export default function FormateursPage() {
  return (
    <main>
      <Navbar solid />
      <section className="bg-ink py-20 text-white sm:py-28">
        <div className="section-shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="eyebrow mb-5 text-gold">L’expertise en action</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-7xl">Des professionnels qui savent transmettre.</h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-white/65">Chez ELIVA SCHOOL, chaque parcours est porté par une personne qui pratique son métier et transforme son expérience en méthodes utiles.</p>
        </div>
      </section>
      <section className="section-shell py-20 sm:py-28">
        <div className="mb-10 flex flex-col justify-between gap-7 sm:mb-14 sm:flex-row sm:items-end"><SectionHeading eyebrow="L’équipe pédagogique" title="Rencontrez vos futurs mentors." description="Une équipe humaine, spécialisée et engagée dans la progression concrète de chaque apprenant." /><Button href="/formations" variant="text">Voir les formations <span aria-hidden>↗</span></Button></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{trainers.map((trainer) => <TrainerCard key={trainer.slug} trainer={trainer} />)}</div>
      </section>
      <section className="border-y border-ink/10 bg-sand py-16 sm:py-20"><div className="section-shell grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="eyebrow mb-3 text-gold-dark">Une question sur un parcours ?</p><h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Choisissez la bonne expertise pour votre objectif.</h2></div><Button href="/formations">Explorer les formations <span aria-hidden>↗</span></Button></div></section>
      <Footer />
    </main>
  );
}
