import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";
import { Button } from "@/components/ui/button";
import { getTrainerBySlug, trainers } from "@/lib/trainers";

type TrainerPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return trainers.map((trainer) => ({ slug: trainer.slug }));
}

export async function generateMetadata({ params }: TrainerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trainer = getTrainerBySlug(slug);
  if (!trainer) return { title: "Formateur introuvable | ELIVA SCHOOL" };

  return {
    title: `${trainer.name} — ${trainer.role} | ELIVA SCHOOL`,
    description: trainer.shortBio,
    alternates: { canonical: `/formateurs/${trainer.slug}` },
    openGraph: {
      title: `${trainer.name} — ${trainer.role}`,
      description: trainer.shortBio,
      type: "profile",
      images: [{ url: trainer.image, alt: trainer.alt }],
    },
    twitter: { card: "summary_large_image", title: trainer.name, description: trainer.shortBio, images: [trainer.image] },
  };
}

export default async function TrainerProfilePage({ params }: TrainerPageProps) {
  const { slug } = await params;
  const trainer = getTrainerBySlug(slug);
  if (!trainer) notFound();

  return (
    <main>
      <Navbar solid />
      <section className="bg-ink py-12 text-white sm:py-20">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/5 lg:mx-0">
            <Image src={trainer.image} alt={trainer.alt} fill priority sizes="(max-width: 1023px) 100vw, 40vw" className="object-cover object-[72%_center]" />
          </div>
          <div>
            <p className="eyebrow mb-5 text-gold">Formateur ELIVA SCHOOL</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-7xl">{trainer.name}</h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-gold">{trainer.role}</p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65">{trainer.shortBio}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button href={`/formations/${trainer.course.slug}`}>Découvrir la formation <span aria-hidden>↗</span></Button><Button href="mailto:bonjour@eliva.school" variant="text" className="border-white/30 text-white hover:border-white">S’inscrire / être conseillé</Button></div>
          </div>
        </div>
      </section>
      <section className="section-shell grid gap-10 py-20 sm:py-28 lg:grid-cols-[0.8fr_1.2fr]">
        <div><p className="eyebrow mb-5 text-gold-dark">Ce que vous allez travailler</p><h2 className="text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-5xl">Une expertise qui se transforme en pratique.</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">{trainer.expertise.map((item, index) => <div key={item} className="rounded-2xl border border-ink/10 bg-white p-5"><span className="font-mono text-xs text-gold-dark">0{index + 1}</span><p className="mt-8 font-semibold">{item}</p></div>)}</div>
      </section>
      <section className="border-y border-ink/10 bg-sand py-20 sm:py-28"><div className="section-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="eyebrow mb-5 text-gold-dark">Parcours & références</p><h2 className="text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-5xl">Une expérience au service de votre progression.</h2></div><ul className="grid gap-4">{trainer.credentials.map((credential) => <li key={credential} className="flex gap-4 border-b border-ink/10 pb-4 text-base leading-7"><span className="text-gold-dark" aria-hidden>✦</span><span>{credential}</span></li>)}</ul></div></section>
      <section className="section-shell py-20 sm:py-28"><div className="rounded-3xl bg-gold p-8 sm:p-12 lg:flex lg:items-end lg:justify-between lg:gap-12"><div><p className="eyebrow mb-5 text-ink/60">Formation animée</p><h2 className="max-w-2xl text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-5xl">{trainer.course.title}</h2><p className="mt-5 max-w-xl text-base leading-7 text-ink/70">{trainer.course.excerpt}</p></div><Button className="mt-8 shrink-0 lg:mt-0" href={`/formations/${trainer.course.slug}`} variant="dark">Découvrir le parcours <span aria-hidden>↗</span></Button></div></section>
      <Footer />
    </main>
  );
}
