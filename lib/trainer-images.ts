export const trainerImages: Record<string, string> = {
  "ilyes-belhay": "/images/trainers/meritify_trainer_ilyes_belhay.png",
  "djebbour-mohamed": "/images/trainers/meritify_trainer_djebbour_mohamed.png",
  "amina-mghizili": "/images/trainers/meritify_trainer_amina_mghizili.png",
  "toufik-derdour": "/images/trainers/meritify_trainer_toufik_derdour.png",
  "safa-belkharchouche": "/images/trainers/meritify_trainer_safa_belkharchouche.png",
};

const legacyTrainerImages: Record<string, string> = {
  "/images/trainers/ChatGPT Image 11 août 2026, 15_39_45.png": trainerImages["djebbour-mohamed"],
  "/images/trainers/ChatGPT Image 11 août 2026, 15_40_27.png": trainerImages["amina-mghizili"],
  "/images/trainers/ChatGPT Image 11 août 2026, 15_40_58.png": trainerImages["toufik-derdour"],
  "/images/trainers/safa-belkharchouche.webp": trainerImages["safa-belkharchouche"],
  "/images/trainers/ilyes-belhay.webp": trainerImages["ilyes-belhay"],
};

export function getTrainerImage(slug: string, currentPath?: string | null) {
  if (currentPath && legacyTrainerImages[currentPath]) return legacyTrainerImages[currentPath];
  return currentPath ?? trainerImages[slug];
}
