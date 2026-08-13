export type RegistrationPayload = {
  fullName: string; phone: string; formation: string; courseName: string; studyMode: string; wilaya: string; email?: string; message?: string; consent: boolean; sourcePage?: string; landingPage?: string; referrer?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string; utmContent?: string; utmTerm?: string; status: "new";
};

export async function submitRegistration(payload: RegistrationPayload) {
  const response = await fetch("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) return { ok: false as const, mode: "supabase" as const, error: "Unable to save registration." };
  return { ok: true as const, mode: "supabase" as const };
}
