export const courseImages: Record<string, string> = {
  "formation-de-formateurs-tot": "/images/courses/tot-training-of-trainers-meritify.png",
  "agent-de-voyage": "/images/courses/agent-voyage-meritify.png",
  photographie: "/images/courses/photographie-meritify.png",
  "educatrice-enfants-gerante-creche": "/images/courses/petite-enfance-meritify.png",
  "ecommerce-marketing-digital": "/images/courses/ecommerce-digital-marketing-meritify.png",
};

const legacyCourseImages: Record<string, string> = {
  "/images/courses/tot.webp": courseImages["formation-de-formateurs-tot"],
  "/images/courses/agent-voyage.webp": courseImages["agent-de-voyage"],
  "/images/courses/photographie.webp": courseImages.photographie,
  "/images/courses/petite-enfance.webp": courseImages["educatrice-enfants-gerante-creche"],
  "/images/courses/ecommerce-digital-marketing.webp": courseImages["ecommerce-marketing-digital"],
};

export function getCourseImage(slug: string, currentPath?: string | null) {
  if (currentPath && legacyCourseImages[currentPath]) return legacyCourseImages[currentPath];
  return currentPath ?? courseImages[slug];
}
