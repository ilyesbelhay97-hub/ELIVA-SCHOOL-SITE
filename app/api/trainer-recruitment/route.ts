import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { trainerRecruitmentSchema } from "@/lib/validation/trainer-recruitment";
import { createServiceClient } from "@/lib/supabase/service";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";

const MAX_CV_BYTES = 5 * 1024 * 1024;
export async function POST(request: Request) {
  const limit = await consumeRateLimit("trainer-recruitment", requestIdentifier(request), 3600, 3);
  if (limit.unavailable) return NextResponse.json({ error: "Le service est momentanément indisponible. Réessayez plus tard." }, { status: 503 });
  if (!limit.allowed) return NextResponse.json({ error: "Trop de candidatures depuis cette connexion. Réessayez plus tard." }, { status: 429 });
  try {
    const formData = await request.formData();
    const cv = formData.get("cv");
    if (!(cv instanceof File) || cv.size === 0) return NextResponse.json({ error: "Veuillez joindre votre CV au format PDF." }, { status: 400 });
    if (cv.size > MAX_CV_BYTES || cv.type !== "application/pdf" || !cv.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "Le CV doit être un fichier PDF de 5 Mo maximum." }, { status: 400 });
    const header = new TextDecoder().decode((await cv.slice(0, 5).arrayBuffer()));
    if (header !== "%PDF-") return NextResponse.json({ error: "Le fichier envoyé ne semble pas être un PDF valide." }, { status: 400 });
    const parsed = trainerRecruitmentSchema.safeParse({ full_name: formData.get("full_name"), phone: formData.get("phone"), email: formData.get("email"), wilaya: formData.get("wilaya"), city: formData.get("city") || undefined, birth_year: formData.get("birth_year") || undefined, current_job: formData.get("current_job"), specialty: formData.get("specialty"), years_experience: formData.get("years_experience"), professional_bio: formData.get("professional_bio"), has_training_experience: formData.get("has_training_experience"), training_experience_details: formData.get("training_experience_details") || undefined, courses_can_teach: formData.get("courses_can_teach"), skills: formData.get("skills"), education_level: formData.get("education_level") || undefined, certifications_summary: formData.get("certifications_summary") || undefined, linkedin_url: formData.get("linkedin_url") || "", website_url: formData.get("website_url") || "", languages: formData.get("languages"), available_wilayas: formData.get("available_wilayas"), training_mode_preferences: formData.getAll("training_mode_preferences"), availability: formData.get("availability"), motivation: formData.get("motivation"), additional_information: formData.get("additional_information") || undefined, consent: formData.get("consent") === "true", website: formData.get("website") || "" });
    if (!parsed.success) return NextResponse.json({ error: "Vérifiez les champs obligatoires de votre candidature." }, { status: 400 });
    const applicationId = randomUUID();
    const path = `applications/${applicationId}/cv.pdf`;
    const service = createServiceClient();
    const upload = await service.storage.from("trainer-cv").upload(path, await cv.arrayBuffer(), { contentType: "application/pdf", upsert: false });
    if (upload.error) return NextResponse.json({ error: "Le CV n’a pas pu être enregistré. Réessayez plus tard." }, { status: 503 });
    const value = parsed.data;
    const insert = await (service.from("trainers_crm") as unknown as { insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }> }).insert({ full_name: value.full_name, phone: value.phone, email: value.email, wilaya: value.wilaya, city: value.city || null, specialty: value.specialty, years_experience: value.years_experience, skills: value.skills.split(",").map((item) => item.trim()).filter(Boolean), courses_can_teach: value.courses_can_teach.split(",").map((item) => item.trim()).filter(Boolean), cv_url: path, status: "not_contacted", source: "website_recruitment", applied_at: new Date().toISOString(), birth_year: value.birth_year || null, linkedin_url: value.linkedin_url || null, website_url: value.website_url || null, training_mode_preferences: value.training_mode_preferences, available_wilayas: value.available_wilayas.split(",").map((item) => item.trim()).filter(Boolean), languages: value.languages.split(",").map((item) => item.trim()).filter(Boolean), education_level: value.education_level || null, certifications_summary: value.certifications_summary || null, motivation: value.motivation, internal_notes: [value.current_job, value.professional_bio, value.training_experience_details, value.additional_information].filter(Boolean).join("\n\n"), public_application_id: applicationId, recruitment_consent: true });
    if (insert.error) { await service.storage.from("trainer-cv").remove([path]); return NextResponse.json({ error: "Votre candidature n’a pas pu être enregistrée. Réessayez plus tard." }, { status: 503 }); }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 }); }
}
