"use client";

/* The confirmation link is rendered after client-side submission state changes. */
/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { algerianWilayas } from "@/lib/algeria";
import { submitRegistration, type RegistrationPayload } from "@/lib/registrations/submit-registration";
import { track } from "@/lib/analytics/track";

type CourseOption = { slug: string; title: string; modes: string[] };
type FormValues = { fullName: string; phone: string; formation: string; studyMode: string; wilaya: string; email: string; message: string; consent: boolean };
type FormErrors = Partial<Record<keyof FormValues, string>>;
const emptyValues: FormValues = { fullName: "", phone: "", formation: "", studyMode: "", wilaya: "", email: "", message: "", consent: false };

function getTrackingContext() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return { sourcePage: window.location.pathname, landingPage: window.location.pathname, referrer: document.referrer || undefined, utmSource: params.get("utm_source") ?? undefined, utmMedium: params.get("utm_medium") ?? undefined, utmCampaign: params.get("utm_campaign") ?? undefined, utmContent: params.get("utm_content") ?? undefined, utmTerm: params.get("utm_term") ?? undefined };
}

export function RegistrationForm({ courseOptions, initialCourse }: { courseOptions: CourseOption[]; initialCourse?: string }) {
  const [values, setValues] = useState<FormValues>({ ...emptyValues, formation: initialCourse ?? "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const selectedCourse = useMemo(() => courseOptions.find((course) => course.slug === values.formation), [courseOptions, values.formation]);
  const modes = useMemo(() => selectedCourse?.modes ?? [], [selectedCourse]);

  useEffect(() => { track("start_registration", { formation: initialCourse }); }, [initialCourse]);

  function update(name: keyof FormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function validate() {
    const next: FormErrors = {};
    const phone = values.phone.replace(/[\s().-]/g, "");
    if (!values.fullName.trim()) next.fullName = "Indiquez votre nom et prénom.";
    if (!values.phone.trim()) next.phone = "Indiquez votre numéro de téléphone.";
    else if (!/^(?:\+213|0)(?:5|6|7)\d{8}$/.test(phone)) next.phone = "Utilisez un numéro algérien valide, par exemple +213 5 XX XX XX XX.";
    if (!values.formation) next.formation = "Choisissez une formation.";
    if (!values.studyMode) next.studyMode = "Choisissez un mode disponible.";
    if (!values.wilaya.trim() || !algerianWilayas.includes(values.wilaya.trim() as (typeof algerianWilayas)[number])) next.wilaya = "Choisissez une wilaya dans la liste.";
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Vérifiez votre adresse e-mail.";
    if (!values.consent) next.consent = "Votre consentement est nécessaire.";
    setErrors(next); return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!validate()) return; setStatus("loading");
    track("submit_registration", { formation: values.formation, studyMode: values.studyMode });
    const payload: RegistrationPayload = { fullName: values.fullName.trim(), phone: values.phone.trim(), formation: values.formation, courseName: selectedCourse?.title ?? values.formation, studyMode: values.studyMode, wilaya: values.wilaya.trim(), email: values.email.trim() || undefined, message: values.message.trim() || undefined, consent: values.consent, status: "new", ...getTrackingContext() };
    try { const result = await submitRegistration(payload); if (!result.ok) throw new globalThis.Error("submission failed"); track("registration_success", { formation: values.formation }); setStatus("success"); } catch { setStatus("error"); }
  }

  if (status === "success") {
    const whatsappBase = process.env.NEXT_PUBLIC_WHATSAPP_URL;
    const message = encodeURIComponent(`Bonjour, je m'appelle ${values.fullName}. Je suis intéressé(e) par ${selectedCourse?.title ?? values.formation} en mode ${values.studyMode}.`);
    const whatsappHref = whatsappBase ? `${whatsappBase}${whatsappBase.includes("?") ? "&" : "?"}text=${message}` : undefined;
    return <div className="rounded-3xl border border-gold/30 bg-gold/10 p-7 sm:p-10" role="status"><p className="eyebrow mb-4 text-gold-dark">Demande enregistrée ✓</p><h2 className="text-3xl font-semibold tracking-[-0.05em]">Votre demande est enregistrée ✓</h2><p className="mt-4 max-w-xl text-sm leading-6 text-ink/65">Merci {values.fullName.split(" ")[0]}. Nous vous contacterons prochainement pour confirmer votre inscription à la formation {selectedCourse?.title ?? values.formation}, en mode {values.studyMode}.</p><div className="mt-6 flex flex-wrap gap-3"><a className="inline-flex min-h-12 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white" href="/inscription/merci">Voir la confirmation ↗</a>{whatsappHref && <a className="inline-flex min-h-12 items-center rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink" href={whatsappHref} target="_blank" rel="noreferrer">Continuer sur WhatsApp ↗</a>}</div></div>;
  }

  return <form className="grid gap-5 rounded-3xl border border-ink/10 bg-white p-6 shadow-xl shadow-ink/5 sm:p-8" onSubmit={onSubmit} noValidate><div><p className="eyebrow mb-3 text-gold-dark">Pré-inscription</p><h2 className="text-3xl font-semibold tracking-[-0.05em]">Parlons de votre projet.</h2><p className="mt-3 text-sm leading-6 text-ink/60">Les champs marqués d’un * sont nécessaires.</p></div>{status === "error" && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">Une erreur temporaire est survenue. Vous pouvez réessayer.</p>}<div className="grid gap-5 sm:grid-cols-2"><Field label="Nom et prénom *" name="fullName" value={values.fullName} error={errors.fullName} onChange={update} autoComplete="name" /><Field label="Téléphone / WhatsApp *" name="phone" type="tel" value={values.phone} error={errors.phone} onChange={update} autoComplete="tel" placeholder="+213 5 XX XX XX XX" /><div className="sm:col-span-2"><label className="grid gap-2 text-sm font-semibold" htmlFor="formation">Formation souhaitée *<select id="formation" value={values.formation} onChange={(event) => { const nextCourse = courseOptions.find((course) => course.slug === event.target.value); setValues((current) => ({ ...current, formation: event.target.value, studyMode: nextCourse?.modes[0] ?? "" })); }} className="mt-0 min-h-12 rounded-xl border border-ink/15 bg-background px-4 text-sm font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold/40"><option value="">Choisir une formation</option>{courseOptions.map((course) => <option key={course.slug} value={course.slug}>{course.title}</option>)}</select></label>{errors.formation && <Error text={errors.formation} />}</div><div><label className="grid gap-2 text-sm font-semibold" htmlFor="studyMode">Mode de formation *<select id="studyMode" value={values.studyMode} disabled={!selectedCourse} onChange={(event) => update("studyMode", event.target.value)} className="mt-0 min-h-12 rounded-xl border border-ink/15 bg-background px-4 text-sm font-normal outline-none disabled:opacity-50 focus:border-ink focus:ring-2 focus:ring-gold/40"><option value="">{selectedCourse ? "Choisir un mode" : "Choisissez une formation"}</option>{modes.map((mode) => <option key={mode}>{mode}</option>)}</select></label>{errors.studyMode && <Error text={errors.studyMode} />}</div><div><label className="grid gap-2 text-sm font-semibold" htmlFor="wilaya">Wilaya *<input id="wilaya" list="algerian-wilayas" value={values.wilaya} onChange={(event) => update("wilaya", event.target.value)} className="mt-0 min-h-12 rounded-xl border border-ink/15 bg-background px-4 text-sm font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold/40" autoComplete="address-level1" /></label><datalist id="algerian-wilayas">{algerianWilayas.map((wilaya) => <option key={wilaya} value={wilaya} />)}</datalist>{errors.wilaya && <Error text={errors.wilaya} />}</div><Field label="E-mail" name="email" type="email" value={values.email} error={errors.email} onChange={update} autoComplete="email" /></div><div><label className="grid gap-2 text-sm font-semibold" htmlFor="message">Message <span className="font-normal text-ink/50">(optionnel)</span><textarea id="message" rows={4} value={values.message} onChange={(event) => update("message", event.target.value)} className="resize-y rounded-xl border border-ink/15 bg-background px-4 py-3 text-sm font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold/40" /></label></div><label className="flex items-start gap-3 text-sm leading-6 text-ink/70"><input type="checkbox" checked={values.consent} onChange={(event) => update("consent", event.target.checked)} className="mt-1 size-5 accent-ink" /> <span>J’accepte d’être contacté(e) au sujet de ma demande d’inscription. *</span></label>{errors.consent && <Error text={errors.consent} />}<button className="min-h-12 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-gold disabled:cursor-wait disabled:opacity-60" type="submit" disabled={status === "loading"}>{status === "loading" ? "Préparation…" : "Envoyer ma demande d’inscription"} <span aria-hidden>↗</span></button><p className="text-xs leading-5 text-ink/45">Cette version prépare le parcours de soumission ; aucune donnée n’est encore enregistrée dans une base externe.</p></form>;
}

function Error({ text }: { text?: string }) { return text ? <p className="mt-1 text-xs font-normal text-red-700">{text}</p> : null; }
function Field({ label, name, type = "text", value, error, onChange, autoComplete, placeholder }: { label: string; name: keyof FormValues; type?: string; value: string; error?: string; onChange: (name: keyof FormValues, value: string | boolean) => void; autoComplete?: string; placeholder?: string }) { return <div><label className="grid gap-2 text-sm font-semibold" htmlFor={name}>{label}<input id={name} name={name} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(name, event.target.value)} autoComplete={autoComplete} aria-invalid={Boolean(error)} className="mt-0 min-h-12 rounded-xl border border-ink/15 bg-background px-4 text-sm font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold/40" /></label><Error text={error} /></div>; }
