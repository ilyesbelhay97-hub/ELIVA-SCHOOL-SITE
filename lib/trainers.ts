import type { Course } from "@/lib/content";

export type Trainer = {
  slug: string;
  name: string;
  role: string;
  image: string;
  alt: string;
  shortBio: string;
  credibility: string;
  expertise: string[];
  credentials: string[];
  course: Course;
};

export const trainers: Trainer[] = [
  {
    slug: "djebbour-mohamed",
    name: "Djebbour Mohamed",
    role: "Formateur international & expert commercial",
    image: "/images/trainers/ChatGPT Image 11 août 2026, 15_39_45.png",
    alt: "Djebbour Mohamed, formateur international ELIVA SCHOOL",
    shortBio: "Formateur international spécialisé dans la formation de formateurs et le développement des compétences commerciales. Il accompagne les participants dans la prise de parole, la conception de programmes et la transmission professionnelle du savoir.",
    credibility: "Formateur international, diplômé et accrédité en formation",
    expertise: ["Prise de parole", "Pédagogie pour adultes", "Conception de formations", "Développement commercial"],
    credentials: ["Formateur international", "Expert commercial", "Diplômé de l’Université canadienne de formation", "Accrédité par l’Académie allemande de formation"],
    course: {
      slug: "formation-de-formateurs-tot",
      trainerSlug: "djebbour-mohamed",
      trainerName: "Djebbour Mohamed",
      category: "Formation de formateurs",
      title: "Formation de Formateurs — TOT",
      excerpt: "Structurer, animer et évaluer des formations mémorables.",
      city: "Constantine",
      date: "Prochaine session à confirmer",
      duration: "5 jours",
      format: "Présentiel",
      tone: "orange",
    },
  },
  {
    slug: "amina-mghizili",
    name: "Amina Mghizili",
    role: "Cadre marketing chez Air Algérie",
    image: "/images/trainers/ChatGPT Image 11 août 2026, 15_40_27.png",
    alt: "Amina Mghizili, formatrice ELIVA SCHOOL",
    shortBio: "Professionnelle du marketing dans le secteur aérien, elle partage une expérience de terrain utile aux futurs agents de voyage et professionnels du tourisme.",
    credibility: "Cadre marketing chez Air Algérie, spécialiste du secteur aérien",
    expertise: ["Marketing touristique", "Transport aérien", "Relation client", "Métiers du voyage"],
    credentials: ["Cadre marketing chez Air Algérie", "Expérience dans le transport aérien", "Expérience dans le tourisme et le voyage"],
    course: {
      slug: "agent-de-voyage",
      trainerSlug: "amina-mghizili",
      trainerName: "Amina Mghizili",
      category: "Métiers & tourisme",
      title: "Agent de Voyage & Gestion d’Agence",
      excerpt: "Acquérir les bases concrètes pour accueillir, conseiller et accompagner les voyageurs.",
      city: "À définir",
      date: "Prochaine session à confirmer",
      duration: "Format court",
      format: "Présentiel",
      tone: "blue",
    },
  },
  {
    slug: "toufik-derdour",
    name: "Toufik Derdour",
    role: "Formateur international en photographie",
    image: "/images/trainers/ChatGPT Image 11 août 2026, 15_40_58.png",
    alt: "Toufik Derdour, formateur international en photographie",
    shortBio: "Photographe et formateur international avec plus de 11 ans d’expérience, spécialisé dans la pratique de la photographie et l’accompagnement des apprenants vers une maîtrise professionnelle de l’image.",
    credibility: "Plus de 11 ans d’expérience et membre de la FIAP",
    expertise: ["Portrait", "Photographie produit", "Photographie événementielle", "Prise de vue", "Retouche professionnelle"],
    credentials: ["Formateur international", "Membre de la Fédération Internationale de la Photographie", "Plus de 11 ans d’expérience dans la photographie"],
    course: {
      slug: "photographie",
      trainerSlug: "toufik-derdour",
      trainerName: "Toufik Derdour",
      category: "Création & image",
      title: "Photographie",
      excerpt: "Maîtriser les fondamentaux de la prise de vue, du portrait au produit.",
      city: "À définir",
      date: "Prochaine session à confirmer",
      duration: "Format pratique",
      format: "Présentiel",
      tone: "gold",
    },
  },
  {
    slug: "safa-belkharchouche",
    name: "Safa Belkharchouche",
    role: "Formatrice en petite enfance",
    image: "/images/trainers/safa-belkharchouche.webp",
    alt: "Safa Belkharchouche, formatrice en petite enfance",
    shortBio: "Formatrice spécialisée dans la petite enfance, l’encadrement pédagogique et la gestion des structures d’accueil pour enfants.",
    credibility: "Spécialiste de la petite enfance et de la gestion de crèche",
    expertise: ["Petite enfance", "Encadrement pédagogique", "Gestion de crèche", "Formation des éducatrices"],
    credentials: ["Formatrice en petite enfance", "Gérante de crèche", "Expérience dans l’encadrement des éducatrices"],
    course: {
      slug: "educatrice-enfants-gerante-creche",
      trainerSlug: "safa-belkharchouche",
      trainerName: "Safa Belkharchouche",
      category: "Métiers & petite enfance",
      title: "Éducatrice d’enfants & gérante de crèche",
      excerpt: "Développer les compétences pédagogiques et organisationnelles du métier.",
      city: "À définir",
      date: "Prochaine session à confirmer",
      duration: "Parcours pratique",
      format: "Présentiel",
      tone: "blue",
    },
  },
  {
    slug: "ilyes-belhay",
    name: "Ilyes Belhay",
    role: "Formateur E-commerce & Marketing Digital",
    image: "/images/trainers/ilyes-belhay.webp",
    alt: "Ilyes Belhay, formateur en e-commerce et marketing digital",
    shortBio: "Formateur spécialisé en e-commerce et marketing digital, avec plus de 9 ans d’expérience terrain dans le business en ligne, l’acquisition client et le développement de projets e-commerce.",
    credibility: "Plus de 9 ans d’expérience terrain en business en ligne",
    expertise: ["Choix de niche", "Branding", "Sourcing", "Facebook Ads", "TikTok Ads", "IA appliquée au e-commerce"],
    credentials: ["Plus de 9 ans d’expérience en e-commerce", "Expert en acquisition digitale", "Spécialiste de la vente en ligne et du marché local"],
    course: {
      slug: "ecommerce-marketing-digital",
      trainerSlug: "ilyes-belhay",
      trainerName: "Ilyes Belhay",
      category: "Business & e-commerce",
      title: "E-commerce & Digital Marketing",
      excerpt: "Construire une activité en ligne de la niche aux premières campagnes d’acquisition.",
      city: "En ligne & présentiel",
      date: "Prochaine session à confirmer",
      duration: "Parcours pratique",
      format: "Hybride",
      tone: "gold",
    },
  },
];

export function getTrainerBySlug(slug: string) {
  return trainers.find((trainer) => trainer.slug === slug);
}

export function getTrainerCourse(slug: string) {
  return trainers.find((trainer) => trainer.course.slug === slug)?.course;
}
