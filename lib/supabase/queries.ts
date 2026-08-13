import { createClient } from "@/lib/supabase/server";
import { courses as fallbackCourses, type Course } from "@/lib/content";

export async function getPublishedCourses() {
  const supabase = await createClient();
  return supabase.from("courses").select("id, title, slug, excerpt, cover_url, format, featured, categories(name), course_sessions(city, start_date, duration_label, registration_open)").eq("status", "published").order("featured", { ascending: false }).order("created_at", { ascending: false });
}

// Local content remains the source of truth until the approved backend integration phase.
export async function getHomepageCourses(): Promise<Course[]> { return fallbackCourses; }

export async function createRegistration(input: { full_name: string; phone: string; email?: string; wilaya: string; course_id?: string; session_id?: string; preferred_contact_method?: "phone" | "whatsapp" | "email" }) {
  const supabase = await createClient();
  return supabase.from("registrations").insert({ ...input, status: "new" });
}
