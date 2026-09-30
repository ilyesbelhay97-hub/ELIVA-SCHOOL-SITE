import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/admin";

export type LmsRole = "admin" | "trainer" | "student";
export type LmsLocale = "fr" | "ar";

export async function getLmsContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, role: null as LmsRole | null };
  if (isAdminUser(user)) return { supabase, user, profile: { id: user.id, role: "admin" as const, trainer_id: null, display_name: user.email, locale: "fr", status: "active" }, role: "admin" as const };
  const { data: profile } = await supabase.from("lms_profiles").select("id, role, trainer_id, display_name, locale, status, access_start, access_end").eq("id", user.id).maybeSingle();
  const role = profile?.status === "active" ? profile.role as LmsRole : null;
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
