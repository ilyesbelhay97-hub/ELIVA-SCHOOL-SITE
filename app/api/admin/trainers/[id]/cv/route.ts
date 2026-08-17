import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdminUser } from "@/lib/supabase/admin";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminUser(user)) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const limit = await consumeRateLimit("admin-cv", requestIdentifier(_request), 60, 30);
  if (limit.unavailable) return NextResponse.json({ error: "Service admin momentanément indisponible." }, { status: 503 });
  if (!limit.allowed) return NextResponse.json({ error: "Trop de consultations. Réessayez dans une minute." }, { status: 429 });
  const { id } = await context.params; const { data, error } = await supabase.from("trainers_crm").select("cv_url").eq("id", id).single();
  if (error || !data?.cv_url) return NextResponse.json({ error: "CV non disponible." }, { status: 404 });
  const { data: signed, error: signedError } = await createServiceClient().storage.from("trainer-cv").createSignedUrl(data.cv_url, 300);
  if (signedError || !signed?.signedUrl) return NextResponse.json({ error: "Impossible d’ouvrir le CV." }, { status: 503 });
  return NextResponse.json({ url: signed.signedUrl });
}
