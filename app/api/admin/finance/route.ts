import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceClient } from "@/lib/supabase/service";
import { consumeRateLimit, requestIdentifier } from "@/lib/security/rate-limit";
import { isSameOrigin } from "@/lib/security/request";
import type { SupabaseClient } from "@supabase/supabase-js";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const uuid = (value: unknown) => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value) ? value : "";
const receiptTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const paymentMethods = new Set(["cash", "baridimob", "ccp", "bank_transfer", "card", "other"]);

type FinancePaymentRow = { status?: string; payment_date?: string; amount?: number | string; voided_at?: string | null; payment_method?: string; collection_owner?: string };
type BalanceRow = { remaining?: number | string };
type SettlementRow = { status?: string };

function db(): SupabaseClient { return createServiceClient() as unknown as SupabaseClient; }

async function issueReceipt(supabase: SupabaseClient, paymentId: string) {
  const receipt = await supabase.rpc("finance_issue_receipt_number");
  if (receipt.error || !receipt.data) throw new Error("RECEIPT_NUMBER_UNAVAILABLE");
  const token = crypto.randomUUID() + crypto.randomUUID().replaceAll("-", "");
  const update = await supabase.from("finance_payments").update({
    receipt_number: receipt.data,
    receipt_reference: receipt.data,
    receipt_verification_token: token,
    receipt_status: "valide",
  }).eq("id", paymentId);
  if (update.error) throw new Error("RECEIPT_UPDATE_FAILED");
  return { receiptNumber: receipt.data as string, verificationToken: token };
}

async function admin(request?: Request) {
  const { user } = await requireAdmin();
  const limit = request ? await consumeRateLimit("admin-finance", requestIdentifier(request), 60, 120) : { allowed: true };
  if (limit.unavailable) throw new Error("RATE_LIMIT_UNAVAILABLE");
  if (!limit.allowed) throw new Error("RATE_LIMITED");
  return { user, supabase: db() };
}

export async function GET() {
  try {
    const { supabase } = await admin();
    const [registrations, payments, balances, points, sessions, settlements, events, settings] = await Promise.all([
      supabase.from("registrations").select("id,full_name,phone,wilaya,course_name_snapshot,study_mode,agreed_total_amount,next_payment_due_date").order("created_at", { ascending: false }),
      supabase.from("finance_payments").select("*").order("payment_date", { ascending: false }),
      supabase.from("finance_student_balances").select("*"),
      supabase.from("finance_collection_points").select("*").eq("is_active", true).order("name"),
      supabase.from("finance_cash_sessions").select("*, finance_collection_points(name)").order("business_date", { ascending: false }).limit(30),
      supabase.from("finance_partner_settlement_balances").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("finance_events").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("finance_settings").select("*").eq("id", true).maybeSingle(),
    ]);
    const firstError = [registrations, payments, balances, points, sessions, settlements, events, settings].find(result => result.error)?.error;
    if (firstError) return json({ error: "Impossible de charger le module financier." }, 500);
    const today = new Date().toISOString().slice(0, 10);
    const paymentRows = (payments.data ?? []) as FinancePaymentRow[];
    const verifiedToday = paymentRows.filter(payment => payment.status === "verified" && String(payment.payment_date).slice(0, 10) === today && !payment.voided_at);
    const dueToday = (registrations.data ?? []).filter((row) => row.next_payment_due_date === today).length;
    const overdue = (registrations.data ?? []).filter((row) => row.next_payment_due_date && row.next_payment_due_date < today).length;
    const dashboard = {
      todayCollected: verifiedToday.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      cashSkikda: verifiedToday.filter(payment => payment.payment_method === "cash" && payment.collection_owner === "eliva").reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      electronicToday: verifiedToday.filter(payment => payment.payment_method !== "cash").reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      pendingCount: paymentRows.filter(payment => payment.status === "pending").length,
      heldByPartners: paymentRows.filter(payment => payment.status === "verified" && payment.collection_owner === "partner_center" && !payment.voided_at).reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      remainingStudents: (balances.data as BalanceRow[] | null ?? []).reduce((sum, balance) => sum + Number(balance.remaining || 0), 0),
      pendingSettlements: (settlements.data as SettlementRow[] | null ?? []).filter(settlement => settlement.status === "pending" || settlement.status === "partial").length,
      dueToday,
      overdue,
    };
    return json({ dashboard, settings: settings.data ?? null, registrations: registrations.data ?? [], payments: paymentRows, balances: balances.data ?? [], points: points.data ?? [], sessions: sessions.data ?? [], settlements: settlements.data ?? [], events: events.data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return json({ error: "Trop d’actions. Réessayez dans une minute." }, 429);
    if (error instanceof Error && error.message === "RATE_LIMIT_UNAVAILABLE") return json({ error: "Service financier momentanément indisponible." }, 503);
    return json({ error: "Accès admin requis." }, 401);
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Origine de requête non autorisée." }, 403);
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ error: "Requête invalide." }, 400); }
  try {
    const { user, supabase } = await admin(request);
    const action = text(body.action);
    if (action === "add_payment") {
      const registrationId = uuid(body.registration_id); const amount = Number(body.amount); const method = text(body.payment_method); const owner = text(body.collection_owner); const mime = text(body.mime_type); const base64 = text(body.file_base64);
      if (!registrationId || !Number.isFinite(amount) || amount <= 0 || !paymentMethods.has(method) || !["eliva", "partner_center"].includes(owner) || !receiptTypes.has(mime) || !base64) return json({ error: "Étudiant, montant, mode, propriétaire et justificatif sont obligatoires." }, 400);
      const buffer = Buffer.from(base64, "base64"); if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) return json({ error: "Le justificatif doit faire au maximum 5 Mo." }, 400);
      const paymentId = crypto.randomUUID(); const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg"; const path = `finance/${registrationId}/${paymentId}/receipt.${extension}`;
      const upload = await supabase.storage.from("payment-receipts").upload(path, buffer, { contentType: mime, upsert: false }); if (upload.error) return json({ error: "Upload du justificatif impossible." }, 400);
      const inserted = await supabase.from("finance_payments").insert({ id: paymentId, registration_id: registrationId, collection_point_id: uuid(body.collection_point_id) || null, amount, currency: "DZD", payment_method: method, payment_date: text(body.payment_date) || new Date().toISOString(), collection_owner: owner, status: "pending", transaction_reference: text(body.transaction_reference) || null, receipt_path: path, receipt_mime_type: mime, receipt_size_bytes: buffer.byteLength, notes: text(body.notes) || null, received_by: user.id, source_system: "finance" });
      if (inserted.error) { await supabase.storage.from("payment-receipts").remove([path]); return json({ error: "Impossible d’enregistrer le versement." }, 400); }
      await supabase.from("finance_events").insert({ payment_id: paymentId, registration_id: registrationId, event_type: "payment", label: "Nouveau versement à vérifier", metadata: { amount, collection_owner: owner }, actor_id: user.id });
      return json({ ok: true, id: paymentId }, 201);
    }
    if (action === "verify_payment") {
      const paymentId = uuid(body.payment_id); const approved = body.status === "verified"; const reason = text(body.reason);
      if (!paymentId || (!approved && reason.length < 3)) return json({ error: "Un motif est obligatoire pour rejeter le versement." }, 400);
      const current = await supabase.from("finance_payments").select("*").eq("id", paymentId).single(); if (current.error || !current.data) return json({ error: "Versement introuvable." }, 404);
      if (current.data.status !== "pending") return json({ error: "Ce versement a déjà été traité." }, 409);
      if (approved) {
        const balance = await supabase.from("finance_student_balances").select("total_due,paid_verified").eq("registration_id", current.data.registration_id).single();
        const totalDue = Number(balance.data?.total_due ?? 0); const paid = Number(balance.data?.paid_verified ?? 0); const amount = Number(current.data.amount ?? 0);
        if (totalDue > 0 && paid + amount > totalDue && body.allow_overpayment !== true) return json({ error: "Le montant dépasse le solde restant. Confirmez explicitement le trop-perçu.", code: "OVERPAYMENT_CONFIRMATION_REQUIRED" }, 409);
      }
      const result = await supabase.from("finance_payments").update({ status: approved ? "verified" : "rejected", receipt_status: approved ? "valide" : "pending", verified_by: approved ? user.id : null, verified_at: approved ? new Date().toISOString() : null, rejection_reason: approved ? null : reason }).eq("id", paymentId).eq("status", "pending");
      if (result.error) return json({ error: "Impossible de traiter le versement." }, 400);
      const receipt = approved ? await issueReceipt(supabase, paymentId) : null;
      await supabase.from("finance_events").insert({ payment_id: paymentId, registration_id: current.data.registration_id, event_type: "payment", label: approved ? "Versement confirmé" : "Versement rejeté", reason: approved ? null : reason, metadata: { receipt_number: receipt?.receiptNumber ?? null }, actor_id: user.id });
      return json({ ok: true, receipt_reference: receipt?.receiptNumber ?? null, receipt_number: receipt?.receiptNumber ?? null });
    }
    if (action === "void_payment") {
      const paymentId = uuid(body.payment_id); const reason = text(body.reason); if (!paymentId || reason.length < 3) return json({ error: "Le motif de correction est obligatoire." }, 400);
      const current = await supabase.from("finance_payments").select("registration_id,status").eq("id", paymentId).single(); if (current.error || current.data?.status !== "verified") return json({ error: "Seul un versement confirmé peut être annulé." }, 409);
      const result = await supabase.from("finance_payments").update({ status: "voided", receipt_status: "annule", correction_reason: reason, voided_at: new Date().toISOString(), voided_by: user.id, corrected_by: user.id, corrected_at: new Date().toISOString() }).eq("id", paymentId).eq("status", "verified"); if (result.error) return json({ error: "Correction impossible." }, 400);
      await supabase.from("finance_events").insert({ payment_id: paymentId, registration_id: current.data.registration_id, event_type: "payment", label: "Versement annulé / corrigé", reason, actor_id: user.id });
      return json({ ok: true });
    }
    if (action === "reprint_receipt") {
      const paymentId = uuid(body.payment_id); if (!paymentId) return json({ error: "Reçu introuvable." }, 400);
      const payment = await supabase.from("finance_payments").select("registration_id,receipt_number,status").eq("id", paymentId).single();
      if (payment.error || !payment.data || !payment.data.receipt_number) return json({ error: "Aucun reçu valide pour ce versement." }, 404);
      await supabase.from("finance_events").insert({ payment_id: paymentId, registration_id: payment.data.registration_id, event_type: "receipt_reprint", label: "Reçu réimprimé", metadata: { receipt_number: payment.data.receipt_number, duplicate: true }, actor_id: user.id });
      return json({ ok: true, receipt_number: payment.data.receipt_number, duplicate: true });
    }
    if (action === "open_cash") {
      const pointId = uuid(body.collection_point_id); const openingCash = Number(body.opening_cash || 0); const businessDate = text(body.business_date) || new Date().toISOString().slice(0, 10); if (!pointId || openingCash < 0) return json({ error: "Point de collecte et ouverture de caisse requis." }, 400);
      const result = await supabase.from("finance_cash_sessions").insert({ collection_point_id: pointId, business_date: businessDate, opening_cash: openingCash, opened_by: user.id }); if (result.error) return json({ error: "Une caisse existe déjà pour cette date ou les données sont invalides." }, 409); return json({ ok: true });
    }
    if (action === "close_cash") {
      const sessionId = uuid(body.session_id); const actualCash = Number(body.actual_cash); const theoreticalCash = Number(body.theoretical_cash); const note = text(body.closing_note); if (!sessionId || !Number.isFinite(actualCash) || !Number.isFinite(theoreticalCash) || (actualCash !== theoreticalCash && note.length < 3)) return json({ error: "Montants valides et motif obligatoire en cas d’écart." }, 400);
      const result = await supabase.from("finance_cash_sessions").update({ status: "closed", actual_cash: actualCash, theoretical_cash: theoreticalCash, closing_note: note || null, closed_by: user.id }).eq("id", sessionId).eq("status", "open"); if (result.error) return json({ error: "Impossible de clôturer la caisse." }, 400); return json({ ok: true });
    }
    if (action === "save_settlement") {
      let proofPath: string | null = null;
      const proofBase64 = text(body.proof_base64); const proofMime = text(body.proof_mime_type);
      if (proofBase64) {
        if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(proofMime)) return json({ error: "Preuve PDF ou image uniquement." }, 400);
        const proofBuffer = Buffer.from(proofBase64, "base64"); if (proofBuffer.byteLength === 0 || proofBuffer.byteLength > 5 * 1024 * 1024) return json({ error: "La preuve doit faire au maximum 5 Mo." }, 400);
        const proofId = crypto.randomUUID(); const extension = proofMime === "application/pdf" ? "pdf" : proofMime === "image/png" ? "png" : proofMime === "image/webp" ? "webp" : "jpg";
        proofPath = `settlements/${proofId}/proof.${extension}`;
        const upload = await supabase.storage.from("finance-proofs").upload(proofPath, proofBuffer, { contentType: proofMime, upsert: false }); if (upload.error) return json({ error: "Upload de la preuve impossible." }, 400);
      }
      const input = { center_id: uuid(body.center_id), course_id: uuid(body.course_id) || null, session_label: text(body.session_label) || null, period_start: text(body.period_start) || null, period_end: text(body.period_end) || null, gross_collected: Number(body.gross_collected || 0), hall_fee: Number(body.hall_fee || 0), center_commission: Number(body.center_commission || 0), other_deductions: Number(body.other_deductions || 0), transferred_to_eliva: Number(body.transferred_to_eliva || 0), settlement_proof_path: proofPath, notes: text(body.notes) || null, created_by: user.id };
      if (!input.center_id || input.gross_collected < 0 || input.hall_fee < 0 || input.center_commission < 0 || input.other_deductions < 0 || input.transferred_to_eliva < 0) return json({ error: "Les données de règlement sont invalides." }, 400);
      const result = body.id ? await supabase.from("finance_partner_settlements").update(input).eq("id", uuid(body.id)) : await supabase.from("finance_partner_settlements").insert(input); if (result.error) { if (proofPath) await supabase.storage.from("finance-proofs").remove([proofPath]); return json({ error: "Impossible d’enregistrer le règlement." }, 400); } await supabase.from("finance_events").insert({ event_type: "settlement", label: body.id ? "Règlement centre modifié" : "Règlement centre créé", metadata: { center_id: input.center_id, transferred_to_eliva: input.transferred_to_eliva }, actor_id: user.id }); return json({ ok: true });
    }
    if (action === "save_settings") {
      const allowed = ["official_name", "logo_path", "address", "wilaya", "phone", "whatsapp", "email", "website", "receipt_prefix", "receipt_footer", "rc", "nif", "nis", "ai"];
      const input = Object.fromEntries(allowed.map(key => [key, text(body[key]) || null]));
      if (!input.official_name || !input.receipt_prefix) return json({ error: "Nom officiel et préfixe du reçu obligatoires." }, 400);
      const result = await supabase.from("finance_settings").upsert({ id: true, ...input, updated_by: user.id, updated_at: new Date().toISOString() });
      if (result.error) return json({ error: "Impossible d’enregistrer les paramètres." }, 400);
      return json({ ok: true });
    }
    return json({ error: "Action financière inconnue." }, 400);
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return json({ error: "Trop d’actions. Réessayez dans une minute." }, 429);
    if (error instanceof Error && error.message === "RATE_LIMIT_UNAVAILABLE") return json({ error: "Service financier momentanément indisponible." }, 503);
    return json({ error: "Accès admin requis." }, 401);
  }
}
