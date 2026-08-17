import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function ReceiptVerificationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createServiceClient() as unknown as SupabaseClient;
  const { data } = await supabase.from("finance_payments").select("receipt_number,payment_date,amount,currency,status,receipt_status,registration_id").eq("receipt_verification_token", token).maybeSingle();
  if (!data || !data.receipt_number) notFound();
  const registration = await supabase.from("registrations").select("course_name_snapshot").eq("id", data.registration_id).maybeSingle();
  const status = data.status === "voided" ? "ANNULÉ" : data.receipt_status === "corrige" ? "CORRIGÉ" : "VALIDE";
  return <main className="min-h-screen bg-[#f7f4ed] px-5 py-16 text-[#102952]"><div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b88918]">Vérification publique</p><h1 className="mt-4 text-3xl font-semibold">ELIVA SCHOOL</h1><div className="mt-8 grid gap-4 border-t border-[#102952]/10 pt-6 text-sm"><p><span className="text-[#102952]/55">Reçu</span><br /><strong>{data.receipt_number}</strong></p><p><span className="text-[#102952]/55">Date</span><br /><strong>{new Date(data.payment_date).toLocaleString("fr-FR")}</strong></p><p><span className="text-[#102952]/55">Montant</span><br /><strong>{new Intl.NumberFormat("fr-DZ").format(Number(data.amount))} {data.currency}</strong></p><p><span className="text-[#102952]/55">Formation</span><br /><strong>{registration.data?.course_name_snapshot ?? "—"}</strong></p></div><p className="mt-8 rounded-2xl bg-[#102952] px-4 py-3 text-center text-sm font-semibold text-white">{status}</p><p className="mt-5 text-xs leading-5 text-[#102952]/55">Cette page confirme uniquement l’existence et l’état du reçu. Aucune donnée privée de l’étudiant n’est affichée.</p></div></main>;
}
