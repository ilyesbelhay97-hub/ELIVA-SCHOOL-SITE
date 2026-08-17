import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceClient } from "@/lib/supabase/service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";

export async function GET(_request: Request, context: { params: Promise<{ paymentId: string }> }) {
  try {
    await requireAdmin();
    const limit = await consumeRateLimit("admin-receipt", requestIdentifier(_request), 60, 60);
    if (limit.unavailable) return NextResponse.json({ error: "Service admin momentanément indisponible." }, { status: 503 });
    if (!limit.allowed) return NextResponse.json({ error: "Trop de consultations. Réessayez dans une minute." }, { status: 429 });
    const { paymentId } = await context.params;
    const supabase = createServiceClient() as unknown as SupabaseClient;
    const { data, error } = await supabase.from("finance_payments").select("receipt_path").eq("id", paymentId).single();
    const payment = data as unknown as { receipt_path: string } | null;
    if (error || !payment?.receipt_path) return NextResponse.json({ error: "Justificatif introuvable." }, { status: 404 });
    const signed = await supabase.storage.from("payment-receipts").createSignedUrl(payment.receipt_path, 60);
    if (signed.error || !signed.data?.signedUrl) return NextResponse.json({ error: "Impossible d'ouvrir le justificatif." }, { status: 500 });
    return NextResponse.json({ url: signed.data.signedUrl }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Accès admin requis." }, { status: 401 }); }
}
