import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/admin";

export type LmsRole = "admin" | "trainer" | "student";
export type LmsLocale = "fr" | "ar";
export type LmsProfile = { user_id: string; user_type: string; trainer_id: string | null; display_name: string | null; phone?: string | null; locale: LmsLocale; active: boolean };
export type LmsEnrollment = { id: string; user_id: string; registration_id: string | null; course_id: string; session_id: string | null; student_name_snapshot: string | null; student_email_snapshot: string | null; status: "active" | "suspended" | "completed"; access_starts_at: string; access_ends_at: string | null };

export async function getLmsContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, role: null as LmsRole | null };
  if (isAdminUser(user)) return { supabase, user, profile: { user_id: user.id, user_type: "admin", trainer_id: null, display_name: user.email, locale: "fr" as const, active: true }, role: "admin" as const };
  const { data: profile } = await supabase.from("lms_profiles").select("user_id, user_type, trainer_id, display_name, phone, locale, active").eq("user_id", user.id).maybeSingle();
  const role = profile?.active && ["student", "trainer"].includes(profile.user_type) ? profile.user_type as LmsRole : null;
  return { supabase, user, profile, role };
}

export async function requireLmsRole(role: LmsRole, locale: LmsLocale = "fr") {
  const context = await getLmsContext();
  if (!context.user || (context.role !== role && context.role !== "admin")) redirect(`/${locale}/login`);
  return context;
}

export function localizedValue(locale: LmsLocale, fr: string | null | undefined, ar: string | null | undefined) {
  return locale === "ar" ? (ar || fr || "") : (fr || ar || "");
}

export function roleHome(role: LmsRole, locale: LmsLocale = "fr") {
  return role === "admin" ? "/admin/lms" : role === "trainer" ? `/${locale}/trainer` : `/${locale}/student`;
}
