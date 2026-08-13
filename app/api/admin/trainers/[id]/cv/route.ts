import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); const role = user?.app_metadata && typeof user.app_metadata === "object" && "role" in user.app_metadata ? user.app_metadata.role : undefined;
  if (!user || role !== "admin") return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await context.params; const { data, error } = await supabase.from("trainers_crm").select("cv_url").eq("id", id).single();
  if (error || !data?.cv_url) return NextResponse.json({ error: "CV non disponible." }, { status: 404 });
  const { data: signed, error: signedError } = await createServiceClient().storage.from("trainer-cv").createSignedUrl(data.cv_url, 300);
  if (signedError || !signed?.signedUrl) return NextResponse.json({ error: "Impossible d’ouvrir le CV." }, { status: 503 });
  return NextResponse.json({ url: signed.signedUrl });
}
