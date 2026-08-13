import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

const landingCourses: Record<string, string> = {
  tot: "formation-de-formateurs-tot",
  "agent-voyage": "agent-de-voyage",
  photographie: "photographie",
  "petite-enfance": "educatrice-enfants-gerante-creche",
  "ecommerce-digital-marketing": "ecommerce-marketing-digital",
};

export default async function LocalizedLanding({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const course = landingCourses[slug];
  if (!course) notFound();
  redirect("/" + locale + "/formations/" + course);
}
