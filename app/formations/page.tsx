import { CourseCard } from "@/components/marketing/course-card";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { SectionHeading } from "@/components/ui/section-heading";
import { courseDetails, toCourseCard } from "@/lib/courses";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formations professionnelles | ELIVA SCHOOL",
  description: "Explorez les formations pratiques ELIVA SCHOOL en e-commerce, marketing digital, photographie, tourisme, petite enfance et pédagogie.",
};

export default function FormationsPage() {
  return (
    <main>
      <Navbar solid />
      <section className="bg-ink py-20 text-white sm:py-28">
        <div className="section-shell">
          <p className="eyebrow mb-5 text-gold">Les parcours ELIVA</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-7xl">Des formations pour passer de l’intention à la pratique.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65">Choisissez une compétence, rencontrez son expert et découvrez un format pensé pour votre prochain mouvement professionnel.</p>
        </div>
      </section>
      <section className="section-shell py-20 sm:py-28">
        <div className="mb-10 sm:mb-14"><SectionHeading eyebrow="Explorer par expertise" title="Trouvez votre prochain terrain d’action." description="Les prochaines dates sont confirmées progressivement. Contactez-nous pour connaître les ouvertures et les formats disponibles." /></div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courseDetails.map((course) => <div id={course.slug} key={course.slug}><CourseCard course={toCourseCard(course)} /></div>)}
        </div>
      </section>
      <section className="bg-sand py-16 sm:py-20"><div className="section-shell flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="eyebrow mb-3 text-gold-dark">Besoin d’orientation ?</p><h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Parlons de votre prochaine compétence.</h2></div><a className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-gold" href="mailto:bonjour@eliva.school">Écrire à l’équipe ↗</a></div></section>
      <Footer />
    </main>
  );
}
