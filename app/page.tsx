import { CourseCard } from "@/components/marketing/course-card";
import { Footer } from "@/components/marketing/footer";
import { Hero } from "@/components/marketing/hero";
import { Navbar } from "@/components/marketing/navbar";
import { TrustBadge } from "@/components/marketing/trust-badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories, reasons, steps, faqs } from "@/lib/content";
import { getHomepageCourses } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const courses = await getHomepageCourses();

  return (
    <main className="overflow-hidden">
      <Navbar />
      <Hero />

      <section className="border-y border-ink/10 bg-white" aria-label="Les engagements ELIVA">
        <div className="section-shell grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          <TrustBadge number="01" label="Apprendre en faisant" />
          <TrustBadge number="02" label="Des formateurs de terrain" />
          <TrustBadge number="03" label="Présentiel & en ligne" />
          <TrustBadge number="04" label="Un suivi qui continue" />
        </div>
      </section>

      <section className="section-shell py-20 sm:py-28" id="formations">
        <div className="mb-10 flex flex-col justify-between gap-7 sm:mb-14 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="À l’agenda" title="Les prochaines formations" description="Des formats courts, concrets et pensés pour vous faire passer à l’action." />
          <Button href="#domaines" variant="text">Explorer les domaines <span aria-hidden>↗</span></Button>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {courses.map((course) => <CourseCard key={course.title} course={course} />)}
        </div>
      </section>

      <section className="bg-ink py-20 text-white sm:py-28" id="a-propos">
        <div className="section-shell">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <SectionHeading dark eyebrow="La méthode ELIVA" title="Pas de théorie qui reste dans un carnet." description="Nous créons des espaces où l’on comprend, où l’on pratique et où l’on repart avec une compétence réellement utilisable." />
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 sm:grid-cols-2">
              {reasons.map((reason, index) => (
                <article key={reason.title} className="bg-ink p-7 sm:p-8">
                  <span className="mb-12 block font-mono text-xs text-gold">0{index + 1}</span>
                  <h3 className="mb-3 text-xl font-semibold tracking-tight">{reason.title}</h3>
                  <p className="text-sm leading-6 text-white/60">{reason.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-20 sm:py-28" id="domaines">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="Votre terrain de jeu" title="Des compétences qui suivent le monde réel." description="Choisissez votre prochain terrain d’expérimentation. D’autres domaines arrivent au fil des besoins de notre communauté." />
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category, index) => (
              <a key={category.title} href="#formations" className="group flex min-h-40 flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 transition hover:-translate-y-1 hover:border-ink/30 hover:shadow-xl hover:shadow-ink/5">
                <span className="font-mono text-xs text-ink/40">0{index + 1}</span>
                <span className="flex items-end justify-between gap-3 text-lg font-semibold tracking-tight"><span>{category.title}</span><span className="text-2xl font-normal text-ink/30 transition group-hover:translate-x-1 group-hover:text-gold">↗</span></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-sand py-20 sm:py-28">
        <div className="section-shell">
          <SectionHeading centered eyebrow="Simple comme bonjour" title="Votre prochaine compétence, en quatre temps." />
          <div className="mt-12 grid gap-8 md:grid-cols-4 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative border-t border-ink/20 pt-5 md:pr-5">
                <span className="mb-8 block font-mono text-sm text-gold-dark">0{index + 1}</span>
                <h3 className="mb-2 font-semibold tracking-tight">{step.title}</h3>
                <p className="text-sm leading-6 text-ink/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20 sm:py-28" id="entreprises">
        <div className="relative overflow-hidden rounded-3xl bg-gold p-8 text-white sm:p-12 lg:p-16">
          <div className="relative z-10 max-w-2xl">
            <p className="eyebrow mb-5 text-ink/60">Pour les équipes ambitieuses</p>
            <h2 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl">Faites grandir les compétences qui font avancer votre entreprise.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-ink/70">Ateliers sur mesure, formats intra-entreprise et accompagnement concret pour vos équipes.</p>
            <Button className="mt-8" href="mailto:bonjour@eliva.school" variant="dark">Parler de votre projet <span aria-hidden>↗</span></Button>
          </div>
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-[28px] border-ink/10 sm:h-96 sm:w-96" aria-hidden />
          <div className="absolute -bottom-28 right-24 h-52 w-52 rounded-full bg-ink/10" aria-hidden />
        </div>
      </section>

      <section className="section-shell pb-20 sm:pb-28" id="faq">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="Questions fréquentes" title="Tout ce qu’il faut savoir avant de commencer." description="Une question qui n’est pas ici ? Notre équipe vous répond avec plaisir." />
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold tracking-tight [&::-webkit-details-marker]:hidden">{faq.question}<span className="text-2xl font-light text-ink/40 transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-ink/60">{faq.answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 text-white sm:py-28">
        <div className="section-shell text-center">
          <p className="eyebrow mb-5 text-gold">On commence quand ?</p>
          <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-none tracking-[-0.06em] sm:text-7xl">Votre prochaine compétence peut commencer ici.</h2>
          <Button className="mt-9" href="#formations">Voir les formations <span aria-hidden>↗</span></Button>
        </div>
      </section>
      <Footer />
    </main>
  );
}
