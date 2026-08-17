import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceClient } from "@/lib/supabase/service";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function FinanceReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  await requireAdmin();
  const { paymentId } = await params;
  const supabase = createServiceClient() as unknown as SupabaseClient;
  const [payment, settings] = await Promise.all([
    supabase.from("finance_payments").select("id,registration_id,amount,currency,payment_method,payment_date,collection_owner,status,receipt_number,receipt_status,transaction_reference").eq("id", paymentId).single(),
    supabase.from("finance_settings").select("*").eq("id", true).maybeSingle(),
  ]);
  if (payment.error || !payment.data) notFound();
  const [registration, balance] = await Promise.all([
    supabase.from("registrations").select("full_name,phone,wilaya,course_name_snapshot,study_mode,agreed_total_amount").eq("id", payment.data.registration_id).single(),
    supabase.from("finance_student_balances").select("total_due,paid_verified,remaining").eq("registration_id", payment.data.registration_id).single(),
  ]);
  if (!registration.data) notFound();
  const p = payment.data; const s = settings.data; const b = balance.data;
  return <main className="min-h-screen bg-white p-6 text-black print:p-0"><article className="mx-auto max-w-[148mm] border border-black/20 p-8 print:border-0"><div className="flex items-start justify-between gap-6 border-b border-black/20 pb-5"><div><p className="text-xl font-bold">{s?.official_name ?? "ELIVA SCHOOL"}</p><p className="mt-1 text-xs">{s?.address ?? ""}{s?.wilaya ? ` · ${s.wilaya}` : ""}</p><p className="text-xs">{s?.phone ?? ""}{s?.whatsapp ? ` · WhatsApp ${s.whatsapp}` : ""}</p></div><div className="text-right"><p className="text-xs font-semibold uppercase tracking-[0.15em]">Reçu de paiement</p><p className="mt-2 text-sm font-bold">{p.receipt_number ?? "—"}</p></div></div><div className="mt-6 grid gap-3 text-sm"><p><strong>Étudiant :</strong> {registration.data.full_name}</p><p><strong>Téléphone :</strong> {registration.data.phone}</p><p><strong>Wilaya :</strong> {registration.data.wilaya}</p><p><strong>Formation :</strong> {registration.data.course_name_snapshot ?? "—"}</p><p><strong>Mode :</strong> {registration.data.study_mode === "online" ? "Online" : "Présentiel"}</p></div><div className="mt-7 grid grid-cols-2 gap-3 border-y border-black/20 py-5 text-sm"><p>Montant actuel<br /><strong>{new Intl.NumberFormat("fr-DZ").format(Number(p.amount))} {p.currency}</strong></p><p>Mode de paiement<br /><strong>{p.payment_method}</strong></p><p>Total payé<br /><strong>{new Intl.NumberFormat("fr-DZ").format(Number(b?.paid_verified ?? 0))} DZD</strong></p><p>Reste<br /><strong>{new Intl.NumberFormat("fr-DZ").format(Number(b?.remaining ?? 0))} DZD</strong></p></div><p className="mt-5 text-xs">Date : {new Date(p.payment_date).toLocaleString("fr-FR")} · Statut : <strong>{p.status === "voided" ? "ANNULÉ" : p.receipt_status === "corrige" ? "CORRIGÉ" : "VALIDE"}</strong></p><p className="mt-8 border-t border-black/10 pt-4 text-center text-xs">{s?.receipt_footer ?? "Merci pour votre confiance."}</p><button onClick={() => window.print()} className="mt-7 w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white print:hidden">Imprimer le reçu</button></article></main>;
}
