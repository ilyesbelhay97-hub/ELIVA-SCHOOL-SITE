import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";

export async function GET(request: Request, context: { params: Promise<{ settlementId: string }> }) {
  try {
    const { user } = await requireAdmin();
    const limit = await consumeRateLimit("admin-finance-proof", requestIdentifier(request), 60, 30);
    if (limit.unavailable) return NextResponse.json({ error: "Service financier momentanément indisponible." }, { status: 503 });
    if (!limit.allowed) return NextResponse.json({ error: "Trop de demandes. Réessayez dans une minute." }, { status: 429 });
    const { settlementId } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(settlementId)) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
    const supabase = createServiceClient();
    const { data, error } = await supabase.from("finance_partner_settlements").select("settlement_proof_path").eq("id", settlementId).single();
    const settlement = data as unknown as { settlement_proof_path: string | null } | null;
    if (error || !settlement?.settlement_proof_path) return NextResponse.json({ error: "Preuve introuvable." }, { status: 404 });
    const signed = await supabase.storage.from("finance-proofs").createSignedUrl(settlement.settlement_proof_path, 60);
    if (signed.error || !signed.data?.signedUrl) return NextResponse.json({ error: "Preuve indisponible." }, { status: 404 });
    void user;
    return NextResponse.json({ url: signed.data.signedUrl }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Accès admin requis." }, { status: 401 });
  }
}
