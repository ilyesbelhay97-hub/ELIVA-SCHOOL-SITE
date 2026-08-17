import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceClient } from "@/lib/supabase/service";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function GET(_request: Request, context: { params: Promise<{ paymentId: string }> }) {
  try {
    await requireAdmin();
    const { paymentId } = await context.params;
    const supabase = createServiceClient() as unknown as SupabaseClient;
    const [payment, settings] = await Promise.all([
      supabase.from("finance_payments").select("id,registration_id,amount,currency,payment_method,payment_date,collection_owner,status,receipt_number,receipt_reference,receipt_status,transaction_reference,notes").eq("id", paymentId).single(),
      supabase.from("finance_settings").select("*").eq("id", true).maybeSingle(),
    ]);
    if (payment.error || !payment.data || payment.data.status === "pending" || payment.data.status === "rejected") return NextResponse.json({ error: "Reçu indisponible." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
    const registration = await supabase.from("registrations").select("full_name,phone,wilaya,course_name_snapshot,study_mode,agreed_total_amount").eq("id", payment.data.registration_id).single();
    const balance = await supabase.from("finance_student_balances").select("total_due,paid_verified,remaining").eq("registration_id", payment.data.registration_id).single();
    if (registration.error || !registration.data) return NextResponse.json({ error: "Données étudiant introuvables." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
    return NextResponse.json({ payment: payment.data, registration: registration.data, balance: balance.data ?? null, settings: settings.data ?? null }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Accès admin requis." }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }
}
