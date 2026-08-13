export type TrackingEvent = "view_course" | "click_register" | "start_registration" | "submit_registration" | "registration_success" | "click_whatsapp" | "view_trainer_recruitment" | "start_trainer_application" | "recruitment_step_completed" | "submit_trainer_application" | "trainer_application_success";

export function track(event: TrackingEvent, properties: Record<string, string | undefined> = {}) {
  if (typeof window === "undefined") return;
  const detail = { event, ...properties };
  window.dispatchEvent(new CustomEvent("eliva:track", { detail }));
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) dataLayer.push(detail);
}
