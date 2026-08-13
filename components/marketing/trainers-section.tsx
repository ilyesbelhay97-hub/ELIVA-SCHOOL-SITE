import { TrainerCard } from "@/components/marketing/trainer-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { trainers } from "@/lib/trainers";

export function TrainersSection() {
  return (
    <section className="border-y border-ink/10 bg-sand py-20 sm:py-28" id="formateurs">
      <div className="section-shell">
        <div className="mb-10 flex flex-col justify-between gap-7 sm:mb-14 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="L’expertise en action"
            title="Nos formateurs"
            description="Des professionnels de terrain qui transmettent une expérience réelle, pratique et directement applicable."
          />
          <Button href="/formateurs" variant="text">
            Rencontrer l’équipe <span aria-hidden>↗</span>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.slice(0, 4).map((trainer) => <TrainerCard key={trainer.slug} trainer={trainer} />)}
        </div>
      </div>
    </section>
  );
}
