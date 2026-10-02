import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/admin";
import { isSameOrigin } from "@/lib/security/request";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
    await requireAdmin();
    const body = await request.json() as { email?: string; display_name?: string; role?: "student" | "trainer"; trainer_id?: string; course_id?: string; registration_id?: string; access_end?: string | null };
    const email = body.email?.trim().toLowerCase(); if (!email || !body.role || (body.role === "student" && !body.course_id) || (body.role === "trainer" && !body.trainer_id)) return NextResponse.json({ error: "Email, rôle et lien LMS obligatoires." }, { status: 400 });
    const service = createServiceClient();
    if (body.role === "student") {
      const courseId = body.course_id;
      const registrationId = body.registration_id;
      if (!courseId || !registrationId) return NextResponse.json({ error: "Une inscription CRM est obligatoire pour activer un accès étudiant." }, { status: 400 });
      const registration = await service.from("registrations").select("id, course_id").eq("id", registrationId).maybeSingle();
      if (registration.error || !registration.data || registration.data.course_id !== courseId) return NextResponse.json({ error: "Inscription CRM introuvable ou liée à une autre formation." }, { status: 400 });
      const payment = await service.from("finance_payments").select("id").eq("registration_id", registrationId).eq("status", "verified").is("voided_at", null).limit(1).maybeSingle();
      if (payment.error || !payment.data) return NextResponse.json({ error: "Activation refusée : aucun versement vérifié n’est lié à cette inscription." }, { status: 409 });
    }
    const users = await service.auth.admin.listUsers({ page: 1, perPage: 1000 }); if (users.error) throw users.error;
    let account = users.data.users.find((candidate: { email?: string | null }) => candidate.email?.toLowerCase() === email);
    if (!account) { const created = await service.auth.admin.createUser({ email, email_confirm: true, password: crypto.randomUUID() }); if (created.error || !created.data.user) throw created.error ?? new Error("Compte impossible à créer."); account = created.data.user; }
    const profileData = { user_id: account.id, user_type: body.role, trainer_id: body.role === "trainer" ? body.trainer_id : null, display_name: body.display_name?.trim() || email, active: true };
    const existingProfile = await service.from("lms_profiles").select("user_id").eq("user_id", account.id).maybeSingle();
    if (existingProfile.error) throw existingProfile.error;
    const profile = existingProfile.data ? await service.from("lms_profiles").update(profileData).eq("user_id", account.id).select("user_id").single() : await service.from("lms_profiles").insert(profileData).select("user_id").single();
    if (profile.error) throw profile.error;
    if (body.role === "student") {
      const courseId = body.course_id;
      const registrationId = body.registration_id;
      if (!courseId || !registrationId) throw new Error("Missing student enrollment identifiers.");
      const existingEnrollment = await service.from("lms_enrollments").select("id").eq("user_id", account.id).eq("course_id", courseId).maybeSingle();
      if (existingEnrollment.error) throw existingEnrollment.error;
      const enrollmentData = { user_id: account.id, course_id: courseId, registration_id: registrationId, student_name_snapshot: body.display_name?.trim() || email, student_email_snapshot: email, status: "active", access_starts_at: new Date().toISOString(), access_ends_at: body.access_end || null };
      const enrollment = existingEnrollment.data ? await service.from("lms_enrollments").update(enrollmentData).eq("id", String(existingEnrollment.data.id)) : await service.from("lms_enrollments").insert(enrollmentData);
      if (enrollment.error) throw enrollment.error;
    }
    return NextResponse.json({ ok: true, user_id: account.id });
  } catch (error) { console.error("LMS activation failed:", error instanceof Error ? error.message : "unknown"); return NextResponse.json({ error: "Activation LMS impossible. Vérifiez la configuration Supabase serveur." }, { status: 500 }); }
}
