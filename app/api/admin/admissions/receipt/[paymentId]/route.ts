import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceClient } from "@/lib/supabase/service";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function GET(_request: Request, context: { params: Promise<{ paymentId: string }> }) {
  try {
    await requireAdmin();
    const { paymentId } = await context.params;
    const supabase = createServiceClient() as unknown as SupabaseClient;
    const { data, error } = await supabase.from("admission_payments").select("receipt_path").eq("id", paymentId).single();
    const payment = data as unknown as { receipt_path: string } | null;
    if (error || !payment?.receipt_path) return NextResponse.json({ error: "Justificatif introuvable." }, { status: 404 });
    const signed = await supabase.storage.from("payment-receipts").createSignedUrl(payment.receipt_path, 60);
    if (signed.error || !signed.data?.signedUrl) return NextResponse.json({ error: "Impossible d'ouvrir le justificatif." }, { status: 500 });
    return NextResponse.json({ url: signed.data.signedUrl });
  } catch { return NextResponse.json({ error: "Accès admin requis." }, { status: 401 }); }
}
