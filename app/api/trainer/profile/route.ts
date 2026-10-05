import { NextResponse } from "next/server";
import { getLmsContext } from "@/lib/lms";
import { createServiceClient } from "@/lib/supabase/service";
import { isSameOrigin } from "@/lib/security/request";

const editable = ["full_name", "specialty", "years_experience", "public_title_fr", "public_title_ar", "public_bio_fr", "public_bio_ar", "linkedin_url", "website_url"] as const;
export async function GET() {
  const context = await getLmsContext();
  if (!context.user || context.role !== "trainer" || !context.profile?.trainer_id) return NextResponse.json({ error: "Accès formateur requis." }, { status: 403 });
  const service = createServiceClient(); const [result, request] = await Promise.all([
    service.from("trainers_crm").select("id,full_name,specialty,years_experience,phone,email,linkedin_url,website_url,photo_url,public_photo_path,public_title_fr,public_title_ar,public_bio_fr,public_bio_ar").eq("id", context.profile.trainer_id).maybeSingle(),
    service.from("trainer_profile_change_requests").select("id,status,proposed_changes,created_at,rejection_reason").eq("trainer_id", context.profile.trainer_id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (result.error) return NextResponse.json({ error: "Profil indisponible." }, { status: 500 });
  const proposed = request.data?.status === "pending" && request.data.proposed_changes && typeof request.data.proposed_changes === "object" ? request.data.proposed_changes as Record<string, unknown> : {};
  const merged = result.data ? { ...result.data, ...proposed } : result.data;
  const currentPhoto = typeof merged?.public_photo_path === "string" ? merged.public_photo_path : null;
  const profile = merged ? { ...merged, public_photo_path: currentPhoto?.startsWith("trainers/") ? service.storage.from("trainer-profile-images").getPublicUrl(currentPhoto).data.publicUrl : currentPhoto } : merged;
  return NextResponse.json({ profile, request: request.data ?? null });
}
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  const context = await getLmsContext();
  if (!context.user || context.role !== "trainer" || !context.profile?.trainer_id) return NextResponse.json({ error: "Accès formateur requis." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null; if (!body) return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  const proposed = Object.fromEntries(editable.filter((key) => key in body).map((key) => [key, body[key]]));
  if (!Object.keys(proposed).length) return NextResponse.json({ error: "Aucune modification." }, { status: 400 });
  const service = createServiceClient();
  const pending = await service.from("trainer_profile_change_requests").select("id").eq("trainer_id", context.profile.trainer_id).eq("status", "pending").maybeSingle();
  if (pending.data) return NextResponse.json({ error: "Une demande est déjà en attente de validation." }, { status: 409 });
  const result = await service.from("trainer_profile_change_requests").insert({ trainer_id: context.profile.trainer_id, requested_by: context.user.id, proposed_changes: proposed }).select().single();
  if (result.error) return NextResponse.json({ error: "Impossible d’envoyer la demande de validation." }, { status: 503 });
  return NextResponse.json({ request: result.data, message: "Modification envoyée pour validation administrative." });
}
