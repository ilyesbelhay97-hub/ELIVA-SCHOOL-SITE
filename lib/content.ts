import { courseDetails, toCourseCard } from "@/lib/courses";

export type Course = {
  slug?: string; trainerSlug?: string; trainerName?: string; category: string; title: string; excerpt: string; city: string; date: string; duration: string; format: string; tone: "gold" | "blue" | "orange"; coverImage?: string; benefits?: string[]; modeOptions?: string[];
};

export const courses: Course[] = courseDetails.map(toCourseCard);

export const reasons = [
  { title: "Du concret, tout de suite", description: "Chaque programme s’appuie sur des cas, des exercices et des livrables qui ressemblent à votre réalité." },
  { title: "Des pros qui pratiquent", description: "Nos intervenants transmettent des méthodes qu’ils utilisent encore sur le terrain." },
  { title: "Des groupes à taille humaine", description: "Le format laisse de la place aux questions, aux essais et aux retours personnalisés." },
  { title: "Un élan qui continue", description: "L’apprentissage ne s’arrête pas à la dernière heure : vous repartez avec une prochaine étape." },
];

export const categories = [
  { title: "Business & e-commerce" }, { title: "Marketing digital" }, { title: "Métiers & tourisme" }, { title: "Petite enfance" }, { title: "Création & image" }, { title: "Formation de formateurs" },
];

export const steps = [
  { title: "Choisir", description: "Trouvez le programme qui répond à votre objectif." }, { title: "S’inscrire", description: "Laissez-nous vos coordonnées en quelques instants." }, { title: "Confirmer", description: "Un conseiller vous recontacte avec les détails utiles." }, { title: "Se former", description: "Passez à la pratique, accompagné par nos experts." },
];

export const faqs = [
  { question: "Les formations sont-elles ouvertes aux débutants ?", answer: "Oui. Chaque programme précise son niveau et ses prérequis. La plupart de nos formats sont conçus pour démarrer sereinement." },
  { question: "Puis-je suivre une formation à distance ?", answer: "Certains parcours proposent des contenus complémentaires en ligne. Le mode disponible est indiqué sur chaque programme." },
  { question: "Comment choisir le bon programme ?", answer: "Consultez l’objectif et le contenu de chaque formation, puis contactez-nous si vous hésitez." },
];
