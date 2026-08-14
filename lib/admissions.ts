export type AdmissionStage = "prospect" | "pre_registration" | "student";
export type StudyMode = "presentiel" | "online";
export type AttemptType = "initial_contact" | "dossier_followup";

export type AdmissionRegistration = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  wilaya: string;
  course_name_snapshot: string | null;
  study_mode: StudyMode;
  message: string | null;
  status: string;
  admission_stage: AdmissionStage;
  prospect_status: string;
  pre_registration_status: string | null;
  student_status: string | null;
  next_followup_date: string | null;
  agreed_total_amount: number | null;
  created_at: string;
  updated_at: string;
  admission_attempts: { id: string; attempt_type: AttemptType; attempt_number: number; attempt_date: string; result: string; notes: string | null }[];
  admission_documents: { id: string; document_name: string; is_required: boolean; is_received: boolean; received_at: string | null; notes: string | null }[];
  admission_payments: { id: string; amount: number; payment_method: string; payment_date: string; transaction_reference: string | null; receipt_path: string; verification_status: string; rejection_reason: string | null; notes: string | null }[];
  payment_summary?: { total_due: number; total_verified_paid: number; remaining_amount: number; pending_payments: number } | null;
  admission_events: { id: string; event_type: string; event_label: string; notes: string | null; created_at: string; metadata: Record<string, unknown> }[];
};

export const admissionStageLabels: Record<AdmissionStage, string> = { prospect: "Clients potentiels", pre_registration: "Pré-inscriptions", student: "Inscriptions finales / Étudiants" };
