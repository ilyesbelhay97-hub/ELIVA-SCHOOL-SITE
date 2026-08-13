import type { Metadata } from "next";
import { RegistrationForm } from "@/components/forms/registration-form";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { courseDetails, getCourseBySlug } from "@/lib/courses";

export const metadata: Metadata = { title: "S’inscrire à une formation | ELIVA SCHOOL", description: "Préparez votre demande d’inscription à une formation ELIVA SCHOOL." };

export default async function RegistrationPage({ searchParams }: { searchParams: Promise<{ formation?: string | string[] }> }) {
  const rawFormation = (await searchParams).formation;
  const requestedFormation = Array.isArray(rawFormation) ? rawFormation[0] : rawFormation;
  const initialCourse = requestedFormation && getCourseBySlug(requestedFormation) ? requestedFormation : undefined;
  const courseOptions = courseDetails.map((course) => ({ slug: course.slug, title: course.title, modes: course.modeOptions }));

  return <main><Navbar solid /><section className="bg-ink py-20 text-white sm:py-28"><div className="section-shell"><p className="eyebrow mb-5 text-gold">Votre prochaine étape</p><h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-7xl">Commencez par nous parler de votre objectif.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/65">Quelques informations suffisent pour préparer votre orientation vers le bon parcours.</p></div></section><section className="section-shell grid gap-12 py-16 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:items-start"><div><p className="eyebrow mb-5 text-gold-dark">Inscription</p><h2 className="text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-5xl">Un formulaire court, une prochaine étape claire.</h2><p className="mt-5 text-base leading-7 text-ink/60">Les informations restent dans ce parcours de démonstration. Aucun enregistrement réel n’est effectué avant la prochaine phase technique.</p></div><RegistrationForm courseOptions={courseOptions} initialCourse={initialCourse} /></section><Footer /></main>;
}
