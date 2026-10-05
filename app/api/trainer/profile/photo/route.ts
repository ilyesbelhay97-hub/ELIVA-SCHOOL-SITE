import { NextResponse } from "next/server";
import { getLmsContext } from "@/lib/lms";
import { createServiceClient } from "@/lib/supabase/service";
import { isSameOrigin } from "@/lib/security/request";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

async function owner() {
  const context = await getLmsContext();
  if (!context.user || context.role !== "trainer" || !context.profile?.trainer_id) return null;
  return { context, trainerId: context.profile.trainer_id };
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  const current = await owner();
  if (!current) return NextResponse.json({ error: "Accès formateur requis." }, { status: 403 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File) || !allowed.has(file.type) || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image JPEG, PNG ou WebP de 5 Mo maximum." }, { status: 400 });
  const service = createServiceClient(); const pending = await service.from("trainer_profile_change_requests").select("id").eq("trainer_id", current.trainerId).eq("status", "pending").maybeSingle();
  if (pending.data) return NextResponse.json({ error: "Une demande est déjà en attente de validation." }, { status: 409 });
  const path = `trainers/${current.trainerId}/profile/${crypto.randomUUID()}.${allowed.get(file.type)}`;
  const uploaded = await service.storage.from("trainer-profile-images").upload(path, file, { contentType: file.type, upsert: false });
  if (uploaded.error) return NextResponse.json({ error: "Téléversement impossible." }, { status: 500 });
  const requested = await service.from("trainer_profile_change_requests").insert({ trainer_id: current.trainerId, requested_by: current.context.user.id, proposed_changes: { public_photo_path: path } });
  if (requested.error) { await service.storage.from("trainer-profile-images").remove([path]); return NextResponse.json({ error: "Impossible d’envoyer la photo en validation." }, { status: 500 }); }
  return NextResponse.json({ path: service.storage.from("trainer-profile-images").getPublicUrl(path).data.publicUrl, pending: true });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  const current = await owner();
  if (!current) return NextResponse.json({ error: "Accès formateur requis." }, { status: 403 });
  const service = createServiceClient(); const pending = await service.from("trainer_profile_change_requests").select("id").eq("trainer_id", current.trainerId).eq("status", "pending").maybeSingle();
  if (pending.data) return NextResponse.json({ error: "Traitez d’abord la demande de validation en attente." }, { status: 409 });
  const profile = await service.from("trainers_crm").select("public_photo_path").eq("id", current.trainerId).maybeSingle(); const path = profile.data?.public_photo_path;
  const requested = await service.from("trainer_profile_change_requests").insert({ trainer_id: current.trainerId, requested_by: current.context.user.id, proposed_changes: { public_photo_path: null } });
  return requested.error ? NextResponse.json({ error: "Impossible d’envoyer la demande." }, { status: 500 }) : NextResponse.json({ ok: true, previous_path: path });
}
