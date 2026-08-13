import { getTrainerBySlug } from "@/lib/trainers";
import type { Course } from "@/lib/content";

export type CourseFaq = { question: string; answer: string };
export type CourseModule = { title: string; description: string };

export type CourseDetail = {
  slug: string;
  landingSlug: string;
  title: string;
  shortTitle: string;
  category: string;
  mode: string;
  modeOptions: string[];
  duration: string;
  schedule?: string;
  audience: string[];
  promise: string;
  headline?: string;
  subtitle?: string;
  topics: string[];
  benefits: string[];
  addedValue?: string[];
  practicalExperience?: string[];
  certificates?: string[];
  accreditationNote?: string;
  modules: CourseModule[];
  faqs: CourseFaq[];
  trainerSlug: string;
  coverImage: string;
};

const faq = (question: string, answer: string): CourseFaq => ({ question, answer });
const makeModule = (title: string, description: string): CourseModule => ({ title, description });

export const courseDetails: CourseDetail[] = [
  {
    slug: "formation-de-formateurs-tot", landingSlug: "tot", title: "Formation de Formateurs — TOT", shortTitle: "Formation de Formateurs — TOT", category: "Formation de formateurs", mode: "Présentiel", modeOptions: ["Présentiel"], duration: "Plus de 30 heures de formation pratique intensive", audience: ["Futurs formateurs", "Professionnels", "Consultants", "Coachs", "Managers"], headline: "Devenez un formateur capable d’inspirer, convaincre et transmettre avec impact.", subtitle: "Plus de 30 heures de formation pratique intensive avec Djebbour Mohamed, formateur international & expert commercial.", promise: "Un parcours pratique basé sur des méthodologies professionnelles de formation.", topics: ["Prise de parole", "Méthodologie", "PNL", "Communication", "Gestion du temps"], benefits: ["5 certificats inclus", "Mises en pratique et simulations", "Méthodologies directement applicables"], certificates: ["Certificat Confiance en soi", "Certificat Méthodologie", "Certificat Art de la prise de parole", "Certificat Programmation Neuro-Linguistique", "Certificat Formateur"], accreditationNote: "Possibilité d’obtenir une accréditation internationale en option, moyennant des frais supplémentaires.", modules: [
      makeModule("Module 1 — Art de la prise de parole & influence", "Art de la prise de parole · Présence devant un public · Confiance en soi · Influence et communication"),
      makeModule("Module 2 — Méthodologie du formateur", "Méthodologie de formation · Structuration des idées · Organisation d’une séance · Transmission claire du contenu"),
      makeModule("Module 3 — Programmation Neuro-Linguistique (PNL)", "Principes de la PNL · Styles de communication · Techniques appliquées à la formation"),
      makeModule("Module 4 — Communication & langage corporel", "Communication verbale et non verbale · Langage corporel · Interaction avec le public · Présence du formateur"),
      makeModule("Module 5 — Gestion du temps", "Gestion du temps · Organisation des séances · Gestion du programme · Maintien de l’attention"),
    ], faqs: [faq("À qui s’adresse cette formation ?", "Aux futurs formateurs et aux professionnels qui souhaitent mieux transmettre leur expertise."), faq("La formation est-elle pratique ?", "Oui. Le programme est fondé sur la pratique intensive et des méthodologies professionnelles."), faq("L’accréditation internationale est-elle incluse ?", "Elle est disponible en option, moyennant des frais supplémentaires.")], trainerSlug: "djebbour-mohamed", coverImage: "/images/courses/tot.webp",
  },
  {
    slug: "agent-de-voyage", landingSlug: "agent-voyage", title: "Agent de Voyage & Gestion d’Agence", shortTitle: "Agent de Voyage & Gestion d’Agence", category: "Métiers & tourisme", mode: "Présentiel", modeOptions: ["Présentiel"], duration: "5 jours intensifs", audience: ["Agents de voyage expérimentés", "Responsables d’agences", "Professionnels du tourisme", "Personnes souhaitant lancer leur agence"], subtitle: "Formation accélérée en ouverture et gestion d’une agence de voyage", promise: "Maîtriser les fondamentaux opérationnels, commerciaux et administratifs d’une agence de voyage.", topics: ["Ouverture d’agence", "Gestion", "Billetterie", "Tourisme", "Marketing", "Visa"], benefits: ["Études de cas professionnelles", "Simulations de gestion d’agence", "Formation pratique et échanges d’expériences"], practicalExperience: ["Formation pratique", "Études de cas", "Simulations professionnelles", "Échanges d’expériences"], modules: [
      makeModule("Module 1 — Cadre juridique et réglementaire", "Conditions d’ouverture · Agrément et autorisations · Obligations légales et fiscales · Contrats et responsabilité professionnelle"),
      makeModule("Module 2 — Gestion moderne d’agence", "Organisation interne · Gestion des équipes · Gestion financière · Suivi des ventes · Tableaux de bord · Rentabilité"),
      makeModule("Module 3 — Billetterie et réservation avancée", "Réservations complexes sur Amadeus · Tarification avancée · Revalidation · Reissue · Remboursement · Groupes et corporate"),
      makeModule("Module 4 — Tourisme & conception de produits", "Packages touristiques · Circuits · Négociation avec fournisseurs et hôtels · Gestion des partenariats"),
      makeModule("Module 5 — Marketing digital & développement commercial", "Branding · Réseaux sociaux · Acquisition clients · Fidélisation · Service premium"),
      makeModule("Module 6 — Visa & assistance voyage", "Procédures consulaires · Préparation des dossiers · Assurance voyage · Assistance avant et après voyage"),
      makeModule("Module 7 — Études de cas professionnelles", "Cas réels · Situations difficiles · Simulation complète de gestion d’agence · Analyse des erreurs fréquentes"),
    ], faqs: [faq("À qui s’adresse ce parcours ?", "Aux professionnels du tourisme, responsables d’agences et personnes souhaitant lancer leur agence."), faq("Quelle est l’approche pédagogique ?", "La formation combine pratique, études de cas, simulations et échanges d’expériences."), faq("Comment se termine la formation ?", "Une mise en situation professionnelle et un projet de création ou développement d’agence sont prévus, avec une attestation de formation professionnelle.")], trainerSlug: "amina-mghizili", coverImage: "/images/courses/agent-voyage.webp",
  },
  {
    slug: "photographie", landingSlug: "photographie", title: "Formation Professionnelle en Photographie", shortTitle: "Formation en Photographie", category: "Création & image", mode: "Présentiel", modeOptions: ["Présentiel"], duration: "4 jours intensifs", schedule: "09:00–12:00 · 13:00–16:00", audience: ["Débutants", "Créateurs de contenu", "Entrepreneurs", "Photographes débutants"], headline: "De débutant à photographe prêt à pratiquer.", promise: "Développer une pratique solide, de la prise de vue au workflow professionnel.", topics: ["Fondamentaux", "Matériel", "Studio", "Photographie de produits", "Terrain", "Photoshop & IA", "Business"], benefits: ["Formation pratique dans un studio équipé", "2 sorties pratiques sur le terrain incluses", "Workflow photo et IA"], practicalExperience: ["Formation pratique dans un studio équipé", "2 sorties pratiques sur le terrain incluses."], modules: [
      makeModule("Module 1 — Fondamentaux de la photographie", "Principes essentiels · Comprendre son appareil · Réglages fondamentaux"),
      makeModule("Module 2 — Choisir son matériel", "Choisir une caméra adaptée · Types d’objectifs · Quand utiliser chaque objectif"),
      makeModule("Module 3 — Photographie en studio", "Formation pratique dans un studio équipé · Éclairage · Mise en scène · Prise de vue"),
      makeModule("Module 4 — Photographie de produits", "Setup produit · Lumière · Angles · Composition · Photographie adaptée au e-commerce et à la publicité"),
      makeModule("Module 5 — Pratique sur le terrain", "2 sorties pratiques sur le terrain incluses."),
      makeModule("Module 6 — Photoshop & Intelligence Artificielle", "Retouche photo · Photoshop · Amélioration des images · Utilisation de l’IA dans le workflow du photographe"),
      makeModule("Module 7 — Business de la photographie", "Construire son portfolio · Définir ses services · Trouver ses clients · Développer une activité professionnelle"),
    ], faqs: [faq("Quel est le rythme de la formation ?", "Le programme se déroule sur quatre jours intensifs, de 09:00 à 12:00 puis de 13:00 à 16:00."), faq("La pratique est-elle incluse ?", "Oui. Le parcours inclut la pratique en studio et deux sorties pratiques sur le terrain."), faq("La formation est-elle réservée aux professionnels ?", "Non. Elle commence par les fondamentaux et convient aussi aux débutants." )], trainerSlug: "toufik-derdour", coverImage: "/images/courses/photographie.webp",
  },
  {
    slug: "educatrice-enfants-gerante-creche", landingSlug: "petite-enfance", title: "Petite Enfance — Formation 5 en 1", shortTitle: "Petite Enfance — 5 en 1", category: "Métiers & petite enfance", mode: "Présentiel", modeOptions: ["Présentiel"], duration: "4 jours intensifs", schedule: "09:00–15:00", audience: ["Éducatrices", "Responsables de crèche", "Enseignantes préscolaires", "Personnes souhaitant travailler dans la petite enfance"], headline: "5 FORMATIONS EN 1", promise: "Un parcours pratique pour développer cinq compétences complémentaires dans la petite enfance.", topics: ["Éducatrice d’enfants", "Gestionnaire de crèche", "Enseignante préparatoire & préscolaire", "Méthode Montessori", "Méthode Glenn Doman"], benefits: ["5 FORMATIONS EN 1", "Organisation et pratique pédagogique", "Accompagnement de l’enfant et relation avec les parents"], modules: [
      makeModule("Module 1 — Éducatrice d’enfants", "Rôle et responsabilités · Accompagnement de l’enfant · Activités · Communication · Suivi quotidien"),
      makeModule("Module 2 — Gestionnaire de crèche", "Organisation de la crèche · Gestion quotidienne · Organisation de l’équipe · Accueil et suivi · Communication avec les parents"),
      makeModule("Module 3 — Enseignante préparatoire & préscolaire", "Bases de l’enseignement préscolaire · Préparation des activités · Organisation pédagogique · Accompagnement avant l’école"),
      makeModule("Module 4 — Méthode Montessori", "Principes Montessori · Autonomie · Apprentissage par l’activité · Environnement éducatif"),
      makeModule("Module 5 — Méthode Glenn Doman", "Introduction à la méthode · Stimulation · Apprentissage précoce · Application pédagogique"),
    ], faqs: [faq("Que signifie 5 en 1 ?", "Le parcours regroupe cinq axes : éducatrice d’enfants, gestionnaire de crèche, enseignante préparatoire et préscolaire, Montessori et Glenn Doman."), faq("Quel est l’horaire ?", "La formation dure quatre jours intensifs, de 09:00 à 15:00."), faq("La formation est-elle pratique ?", "Le programme associe repères pédagogiques, organisation et application dans les situations de la petite enfance." )], trainerSlug: "safa-belkharchouche", coverImage: "/images/courses/petite-enfance.webp",
  },
  {
    slug: "ecommerce-marketing-digital", landingSlug: "ecommerce", title: "E-commerce & Digital Marketing", shortTitle: "E-commerce & Digital Marketing", category: "Business & e-commerce", mode: "Présentiel + contenu complémentaire en ligne", modeOptions: ["Présentiel"], duration: "Plus de 30 heures de formation pratique intensive réparties sur 1 mois", audience: ["Débutants", "Porteurs de projet", "Vendeurs en ligne", "Personnes souhaitant lancer ou structurer un business e-commerce"], headline: "Construisez, lancez et développez votre activité e-commerce de A à Z.", subtitle: "De Zéro au Lancement", promise: "Un parcours pratique de la niche au lancement, à l’analyse et à l’optimisation.", topics: ["Niche & stratégie", "Product Research & Sourcing", "Créatives publicitaires", "Boutique", "Facebook Ads", "TikTok Ads", "IA", "Lancement"], benefits: ["Plus de 30 heures de pratique sur 1 mois", "Accès aux vidéos et ressources", "Accompagnement orienté lancement"], addedValue: ["Toutes les vidéos enregistrées", "Contenus détaillés", "Lives hebdomadaires", "Suivi personnalisé", "Ressources supplémentaires", "Accès et accompagnement à vie"], practicalExperience: ["Produit → Offre → Boutique → Creative → Ads → Analyse → Optimisation", "Communauté privée WHOP"], modules: [
      makeModule("Module 1 — Niche & stratégie", "Choisir une niche · Comprendre le marché · Identifier les opportunités"),
      makeModule("Module 2 — Product Research & Sourcing", "Recherche de produits · Analyse des opportunités · Fournisseurs en Algérie · Fournisseurs en Chine"),
      makeModule("Module 3 — Créatives publicitaires", "Créatives · Angles marketing · Hooks · Contenu produit · Publicités orientées conversion"),
      makeModule("Module 4 — Création de boutique E-commerce", "Création de boutique · Pages produit · Offre · Expérience client"),
      makeModule("Module 5 — Facebook Ads", "Création des campagnes · Tests · Analyse des performances · Optimisation"),
      makeModule("Module 6 — TikTok Ads", "Acquisition via TikTok · Création des campagnes · Tests créatifs · Analyse"),
      makeModule("Module 7 — Intelligence Artificielle", "Product research · Copywriting · Créatives · Automatisation · Optimisation du workflow"),
      makeModule("Module 8 — Lancement & optimisation", "Produit → Offre → Boutique → Creative → Ads → Analyse → Optimisation"),
    ], faqs: [faq("Le parcours est-il uniquement en ligne ?", "Le mode proposé est le présentiel, complété par des ressources en ligne."), faq("L’accompagnement continue-t-il après la formation ?", "Oui. La communauté privée WHOP prévoit des vidéos, des lives, un suivi et des ressources supplémentaires."), faq("Faut-il déjà avoir une boutique ?", "Non. Le programme couvre la niche, la recherche produit, la boutique et les campagnes." )], trainerSlug: "ilyes-belhay", coverImage: "/images/courses/ecommerce-digital-marketing.webp",
  },
];

export function getCourseBySlug(slug: string) { return courseDetails.find((course) => course.slug === slug); }
export function getCourseTrainer(course: CourseDetail) { return getTrainerBySlug(course.trainerSlug); }

export function toCourseCard(course: CourseDetail): Course {
  return { slug: course.slug, trainerSlug: course.trainerSlug, trainerName: getCourseTrainer(course)?.name, category: course.category, title: course.title, excerpt: course.headline ?? course.promise, city: "", date: "", duration: course.duration, format: course.mode, tone: course.slug === "agent-de-voyage" ? "blue" : course.slug === "photographie" ? "gold" : course.slug === "educatrice-enfants-gerante-creche" ? "blue" : course.slug === "formation-de-formateurs-tot" ? "orange" : "gold", coverImage: course.coverImage, benefits: course.benefits, modeOptions: course.modeOptions };
}

