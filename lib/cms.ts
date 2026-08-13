import { createClient } from "@/lib/supabase/server";
import { localizedCourse, type Locale } from "@/lib/i18n";

export type CmsCourse = {
  id: string; slug: string; title_fr: string; title_ar: string; short_description_fr: string | null; short_description_ar: string | null; hero_headline_fr: string | null; hero_headline_ar: string | null; modules_fr: unknown[]; modules_ar: unknown[]; faq_fr: unknown[]; faq_ar: unknown[]; study_modes: string[]; wilayas: string[]; price: number | null; seats_available: number | null; next_session_date: string | null; cover_image_path: string | null; publish_status: string; display_order: number; featured: boolean; trainer_id: string | null; seo_title_fr: string | null; seo_title_ar: string | null; seo_description_fr: string | null; seo_description_ar: string | null; trainers_crm?: { full_name: string; public_slug: string | null; is_public: boolean; public_photo_path: string | null } | null;
};

export type CmsTrainer = {
  id: string; full_name: string; public_slug: string | null; is_public: boolean; public_title_fr: string | null; public_title_ar: string | null; public_bio_fr: string | null; public_bio_ar: string | null; public_expertise_fr: unknown[]; public_expertise_ar: unknown[]; public_credentials_fr: unknown[]; public_credentials_ar: unknown[]; public_photo_path: string | null; public_order: number; public_seo_title_fr: string | null; public_seo_title_ar: string | null; public_seo_description_fr: string | null; public_seo_description_ar: string | null;
};

export async function getCmsCourses() {
  const supabase = await createClient();
  const [{ data, error }, trainers] = await Promise.all([
    supabase.from("courses").select("*").eq("publish_status", "published").order("display_order").order("created_at", { ascending: false }),
    supabase.from("public_trainers_cms").select("id,full_name,public_slug,is_public,public_photo_path"),
  ]);
  if (error) return { data: null, error };
  const trainerMap = new Map((trainers.data ?? []).map((trainer) => [trainer.id, trainer]));
  return { data: (data ?? []).map((course) => ({ ...course, trainers_crm: course.trainer_id ? trainerMap.get(course.trainer_id) ?? null : null })), error: trainers.error };
}

export async function getCmsCourse(slug: string) {
  const supabase = await createClient();
  const [{ data, error }, trainers] = await Promise.all([
    supabase.from("courses").select("*").eq("slug", slug).eq("publish_status", "published").maybeSingle(),
    supabase.from("public_trainers_cms").select("id,full_name,public_slug,is_public,public_photo_path"),
  ]);
  if (error || !data) return { data, error };
  const trainer = data.trainer_id ? (trainers.data ?? []).find((row) => row.id === data.trainer_id) ?? null : null;
  return { data: { ...data, trainers_crm: trainer }, error: trainers.error };
}

export async function getCmsTrainers() {
  const supabase = await createClient();
  return supabase.from("public_trainers_cms").select("*").order("public_order").order("full_name");
}

export function cmsCourseToLocalized(course: CmsCourse, locale: Locale) {
  return { slug: course.slug, title: locale === "ar" ? course.title_ar : course.title_fr, category: locale === "ar" ? "دورات مهنية" : "Formation professionnelle", promise: (locale === "ar" ? course.short_description_ar : course.short_description_fr) ?? "", benefits: [], coverImage: course.cover_image_path ?? undefined, trainer: course.trainers_crm?.full_name ?? "" };
}

export function fallbackCmsCourse(slug: string, locale: Locale) {
  const course = localizedCourse[slug]?.[locale];
  return course ? { slug, title: course.title, category: course.category, promise: course.promise, benefits: course.benefits, coverImage: undefined, trainer: "" } : null;
}
