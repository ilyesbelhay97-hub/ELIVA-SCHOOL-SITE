import { createClient } from "@/lib/supabase/server";
import { courses as fallbackCourses, type Course } from "@/lib/content";

export async function getPublishedCourses() {
  const supabase = await createClient();

  return supabase
    .from("courses")
    .select("id, title, slug, excerpt, cover_url, format, featured, categories(name), course_sessions(city, start_date, duration_label, registration_open)")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
}

export async function getHomepageCourses(): Promise<Course[]> {
  try {
    const { data, error } = await getPublishedCourses();
    if (error || !data?.length) return fallbackCourses;

    return data.slice(0, 3).map((course, index) => {
      const session = Array.isArray(course.course_sessions) ? course.course_sessions[0] : course.course_sessions;
      const category = Array.isArray(course.categories) ? course.categories[0] : course.categories;
      const date = session?.start_date
        ? new Date(session.start_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
        : "Prochaine session";

      return {
        category: category?.name ?? "Formation professionnelle",
        title: course.title,
        excerpt: course.excerpt,
        city: session?.city ?? "En ligne",
        date,
        duration: session?.duration_label ?? "À définir",
        format: course.format === "en_ligne" ? "En ligne" : course.format === "hybride" ? "Hybride" : "Présentiel",
        tone: (["gold", "blue", "orange"] as const)[index % 3],
      };
    });
  } catch {
    return fallbackCourses;
  }
}

export async function createRegistration(input: {
  full_name: string;
  phone: string;
  email?: string;
  wilaya: string;
  course_id?: string;
  session_id?: string;
  preferred_contact_method?: "phone" | "whatsapp" | "email";
}) {
  const supabase = await createClient();

  return supabase.from("registrations").insert({
    ...input,
    status: "new",
  });
}
