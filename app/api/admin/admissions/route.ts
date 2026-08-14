import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { createServiceClient } from "@/lib/supabase/service";
import type { SupabaseClient } from "@supabase/supabase-js";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const allowedReceiptTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type AdminDb = SupabaseClient;

async function adminContext(): Promise<AdminDb> {
  await requireAdmin();
  return createServiceClient() as unknown as AdminDb;
}

export async function GET() {
  try {
    const supabase = await adminContext();
    const { data, error } = await supabase.from("registrations").select("*, admission_attempts(*), admission_documents(*), admission_payments(*), admission_events(*)").order("created_at", { ascending: false });
    if (error) return json({ error: "Impossible de charger les admissions." }, 500);
    const ids = (data ?? []).map((row) => row.id);
    const summaries = ids.length ? await supabase.from("admission_payment_summary").select("*").in("registration_id", ids) : { data: [], error: null };
    const summaryMap = new Map((summaries.data ?? []).map((row) => [row.registration_id, row]));
    return json({ data: (data ?? []).map((row) => ({ ...row, payment_summary: summaryMap.get(row.id) ?? null })) });
  } catch { return json({ error: "Session admin indisponible." }, 401); }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return json({ error: "Requête invalide." }, 400); }
  let supabase: AdminDb;
  try { supabase = await adminContext(); } catch { return json({ error: "Accès admin requis." }, 401); }
  const action = text(body.action);

  try {
    if (action === "create_prospect") {
      const full_name = text(body.full_name); const phone = text(body.phone).replace(/[\s().-]/g, ""); const wilaya = text(body.wilaya); const course_name_snapshot = text(body.course_name_snapshot);
      if (full_name.length < 2 || !/^(?:\+213|0)(?:5|6|7)\d{8}$/.test(phone) || !wilaya || !course_name_snapshot) return json({ error: "Nom, téléphone, wilaya et formation sont obligatoires." }, 400);
      const duplicate = await supabase.from("registrations").select("id,full_name,phone").eq("phone", phone).limit(1).maybeSingle();
      if (duplicate.data) return json({ duplicate: duplicate.data }, 409);
      const result = await supabase.from("registrations").insert({ full_name, phone, wilaya, course_name_snapshot, study_mode: body.study_mode === "online" ? "online" : "presentiel", consent: true, status: "new", admission_stage: "prospect", prospect_status: "new", message: text(body.message) || null, source_page: text(body.source_page) || "admin" }).select("id").single();
      if (result.error) throw result.error;
      await supabase.from("admission_events").insert({ registration_id: result.data.id, event_type: "creation", event_label: "Nouveau client potentiel", metadata: { source: "admin" } });
      return json({ ok: true, id: result.data.id }, 201);
    }
    if (action === "move_to_pre_registration") {
      const { error } = await supabase.rpc("move_to_pre_registration", { p_registration_id: text(body.registration_id), p_study_mode: body.study_mode === "online" ? "online" : "presentiel", p_agreed_total_amount: body.agreed_total_amount ? Number(body.agreed_total_amount) : null });
      if (error) throw error;
      return json({ ok: true });
    }
    if (action === "record_attempt") {
      const { error } = await supabase.rpc("record_admission_attempt", { p_registration_id: text(body.registration_id), p_attempt_type: text(body.attempt_type), p_result: text(body.result), p_notes: text(body.notes) || null });
      if (error) return json({ error: error.message.includes("Only one") ? "Une seule tentative de ce type est autorisée par jour." : error.message.includes("Maximum") ? "La limite de 3 tentatives est atteinte." : "Impossible d'enregistrer cette action." }, 400);
      return json({ ok: true });
    }
    if (action === "update_document") {
      const registration_id = text(body.registration_id); const input = { document_name: text(body.document_name), is_required: body.is_required !== false, is_received: body.is_received === true, received_at: body.is_received === true ? new Date().toISOString() : null, notes: text(body.notes) || null };
      if (!registration_id || !input.document_name) return json({ error: "Nom du document requis." }, 400);
      const result = body.document_id ? await supabase.from("admission_documents").update(input).eq("id", text(body.document_id)) : await supabase.from("admission_documents").insert({ registration_id, ...input });
      if (result.error) throw result.error;
      if (input.is_received) await supabase.from("admission_events").insert({ registration_id, event_type: "document", event_label: `Document reçu : ${input.document_name}`, metadata: {} });
      return json({ ok: true });
    }
    if (action === "update_admission_status") {
      const registration_id = text(body.registration_id); const updates: Record<string, unknown> = {};
      if (body.prospect_status) updates.prospect_status = text(body.prospect_status);
      if (body.pre_registration_status) updates.pre_registration_status = text(body.pre_registration_status);
      if (body.student_status) updates.student_status = text(body.student_status);
      if (body.agreed_total_amount !== undefined) updates.agreed_total_amount = body.agreed_total_amount ? Number(body.agreed_total_amount) : null;
      const result = await supabase.from("registrations").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", registration_id);
      if (result.error) throw result.error;
      await supabase.from("admission_events").insert({ registration_id, event_type: "status", event_label: "Statut mis à jour", metadata: updates });
      return json({ ok: true });
    }
    if (action === "void_payment") {
      const paymentId = text(body.payment_id); const reason = text(body.correction_reason);
      if (!paymentId || reason.length < 3) return json({ error: "Un motif de correction est obligatoire." }, 400);
      const user = (await supabase.auth.getUser()).data.user;
      const result = await supabase.from("admission_payments").update({ verification_status: "voided", correction_reason: reason, voided_at: new Date().toISOString(), voided_by: user?.id ?? null, updated_at: new Date().toISOString() }).eq("id", paymentId).eq("verification_status", "verified");
      if (result.error) throw result.error;
      const payment = await supabase.from("admission_payments").select("registration_id").eq("id", paymentId).single();
      if (payment.data) await supabase.from("admission_events").insert({ registration_id: payment.data.registration_id, event_type: "payment", event_label: "Versement annulé / corrigé", notes: reason, metadata: { payment_id: paymentId } });
      return json({ ok: true });
    }
    if (action === "confirm_final") {
      const { error } = await supabase.rpc("confirm_final_registration", { p_registration_id: text(body.registration_id) });
      if (error) return json({ error: error.message.includes("dossier") ? "Le dossier présentiel doit être complet." : error.message.includes("payment") ? "Le paiement vérifié est insuffisant." : "Inscription finale impossible." }, 400);
      return json({ ok: true });
    }
    if (action === "add_payment") {
      const registration_id = text(body.registration_id); const mime = text(body.mime_type); const base64 = text(body.file_base64); const amount = Number(body.amount); const paymentDate = text(body.payment_date); const method = text(body.payment_method);
      if (!registration_id || !amount || amount <= 0 || !paymentDate || !["baridimob", "ccp", "bank_transfer", "cash", "other"].includes(method) || !allowedReceiptTypes.has(mime) || !base64) return json({ error: "Montant, mode, date et justificatif image sont obligatoires." }, 400);
      const buffer = Buffer.from(base64, "base64"); if (buffer.byteLength > 5 * 1024 * 1024) return json({ error: "Le justificatif ne doit pas dépasser 5 Mo." }, 400);
      const paymentId = crypto.randomUUID(); const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg"; const path = `registrations/${registration_id}/${paymentId}/receipt.${extension}`;
      const upload = await supabase.storage.from("payment-receipts").upload(path, buffer, { contentType: mime, upsert: false }); if (upload.error) throw upload.error;
      const inserted = await supabase.from("admission_payments").insert({ id: paymentId, registration_id, amount, payment_method: method, payment_date: paymentDate, transaction_reference: text(body.transaction_reference) || null, receipt_path: path, receipt_mime_type: mime, receipt_size_bytes: buffer.byteLength, verification_status: "pending", notes: text(body.notes) || null });
      if (inserted.error) { await supabase.storage.from("payment-receipts").remove([path]); throw inserted.error; }
      await supabase.from("registrations").update({ pre_registration_status: "payment_to_verify", updated_at: new Date().toISOString() }).eq("id", registration_id);
      await supabase.from("admission_events").insert({ registration_id, event_type: "payment", event_label: "Nouveau versement à vérifier", metadata: { payment_id: paymentId, amount } });
      return json({ ok: true }, 201);
    }
    if (action === "verify_payment") {
      const paymentId = text(body.payment_id); const verified = body.verification_status === "verified";
      const result = await supabase.from("admission_payments").update({ verification_status: verified ? "verified" : "rejected", verified_at: verified ? new Date().toISOString() : null, verified_by: verified ? (await supabase.auth.getUser()).data.user?.id ?? null : null, rejection_reason: verified ? null : text(body.rejection_reason) || "Justificatif rejeté", updated_at: new Date().toISOString() }).eq("id", paymentId);
      if (result.error) throw result.error;
      const payment = await supabase.from("admission_payments").select("registration_id").eq("id", paymentId).single(); if (payment.data) await supabase.from("admission_events").insert({ registration_id: payment.data.registration_id, event_type: "payment", event_label: verified ? "Versement confirmé" : "Versement rejeté", metadata: { payment_id: paymentId } });
      return json({ ok: true });
    }
    return json({ error: "Action inconnue." }, 400);
  } catch { return json({ error: "Impossible d'enregistrer cette action." }, 500); }
}
