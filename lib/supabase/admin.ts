import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata && typeof user.app_metadata === "object" && "role" in user.app_metadata ? user.app_metadata.role : undefined;
  const configuredAdmins = (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  const isApprovedEmail = user?.email?.toLowerCase() === "ilyesbelhay97@gmail.com" || (user?.email ? configuredAdmins.includes(user.email.toLowerCase()) : false);
  if (!user || (role !== "admin" && !isApprovedEmail)) redirect("/admin/login");
  return { supabase, user };
}

export type RegistrationRow = {
  id: string; full_name: string; phone: string; email: string | null; wilaya: string; course_name_snapshot: string | null; study_mode: "presentiel" | "online"; message: string | null; consent: boolean; status: string; source_page: string | null; internal_notes: string | null; referrer: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; created_at: string; updated_at: string;
};

export type TrainerCrmRow = {
  id: string; full_name: string; phone: string | null; email: string | null; wilaya: string | null; city: string | null; specialty: string | null; skills: string[]; courses_can_teach: string[]; years_experience: number | null; cv_url: string | null; portfolio_url: string | null; photo_url: string | null; status: string; last_contact_at: string | null; next_action_at: string | null; next_action: string | null; pedagogical_quality: number | null; field_experience: number | null; communication: number | null; availability_rating: number | null; tariff_rating: number | null; expected_fee: number | null; fee_unit: string | null; source: string; applied_at: string | null; birth_year: number | null; linkedin_url: string | null; website_url: string | null; training_mode_preferences: string[]; available_wilayas: string[]; languages: string[]; education_level: string | null; certifications_summary: string | null; motivation: string | null; public_application_id: string | null; recruitment_consent: boolean; internal_notes: string | null; is_favorite: boolean; created_at: string; updated_at: string;
};

export type CenterRow = {
  id: string; center_name: string; wilaya: string; city: string | null; address: string | null; contact_person: string | null; phone: string | null; whatsapp: string | null; email: string | null; capacity: number | null; hourly_rate: number | null; daily_rate: number | null; deposit_amount: number | null; has_projector: boolean; has_wifi: boolean; has_air_conditioning: boolean; has_heating: boolean; has_parking: boolean; has_break_area: boolean; has_sound_system: boolean; has_whiteboard: boolean; google_maps_url: string | null; photos: string[]; rental_conditions: string | null; status: string; already_worked_with: boolean; last_rental_at: string | null; experience_rating: number | null; is_favorite: boolean; internal_notes: string | null; created_at: string; updated_at: string;
};
