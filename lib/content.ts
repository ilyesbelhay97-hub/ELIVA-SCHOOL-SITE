export type Course = {
  category: string;
  title: string;
  excerpt: string;
  city: string;
  date: string;
  duration: string;
  format: string;
  tone: "gold" | "blue" | "orange";
};

export const courses: Course[] = [
  { category: "Business & e-commerce", title: "Lancer son activité en ligne", excerpt: "De l’idée à votre première offre claire et vendable.", city: "Skikda", date: "05 septembre 2026", duration: "3 jours", format: "Présentiel", tone: "gold" },
  { category: "Marketing digital", title: "Social media qui convertit", excerpt: "Construire une présence utile, cohérente et mesurable.", city: "En ligne", date: "12 septembre 2026", duration: "4 semaines", format: "En ligne", tone: "blue" },
  { category: "Formateurs", title: "Train the Trainer", excerpt: "Structurer, animer et évaluer des formations mémorables.", city: "Constantine", date: "19 septembre 2026", duration: "5 jours", format: "Présentiel", tone: "orange" },
];

export const reasons = [
  { title: "Du concret, tout de suite", description: "Chaque programme s’appuie sur des cas, des exercices et des livrables qui ressemblent à votre réalité." },
  { title: "Des pros qui pratiquent", description: "Nos intervenants transmettent des méthodes qu’ils utilisent encore sur le terrain." },
  { title: "Des groupes à taille humaine", description: "Le format laisse de la place aux questions, aux essais et aux retours personnalisés." },
  { title: "Un élan qui continue", description: "L’apprentissage ne s’arrête pas à la dernière heure : vous repartez avec une prochaine étape." },
];

export const categories = [
  { title: "Business & e-commerce" },
  { title: "Marketing digital" },
  { title: "Métiers & santé" },
  { title: "Soft skills" },
  { title: "Intelligence artificielle" },
  { title: "Formation de formateurs" },
];

export const steps = [
  { title: "Choisir", description: "Trouvez le programme qui répond à votre objectif." },
  { title: "S’inscrire", description: "Laissez-nous vos coordonnées en quelques instants." },
  { title: "Confirmer", description: "Un conseiller vous recontacte avec les détails utiles." },
  { title: "Se former", description: "Passez à la pratique, accompagné par nos experts." },
];

export const faqs = [
  { question: "Les formations sont-elles ouvertes aux débutants ?", answer: "Oui. Chaque programme précise son niveau et ses prérequis. La plupart de nos formats sont conçus pour démarrer sereinement, même sans expérience préalable." },
  { question: "Où ont lieu les formations en présentiel ?", answer: "Nous proposons des sessions dans plusieurs villes et ouvrons régulièrement de nouveaux lieux. La ville et l’adresse sont indiquées sur chaque programme." },
  { question: "Puis-je suivre une formation à distance ?", answer: "Oui, certains parcours sont proposés en ligne avec des temps d’échange et des ressources pour pratiquer entre les sessions." },
  { question: "Comment choisir le bon programme ?", answer: "Consultez l’objectif et le niveau de chaque formation, puis contactez-nous si vous hésitez. Un conseiller vous orientera vers le format le plus adapté." },
];
