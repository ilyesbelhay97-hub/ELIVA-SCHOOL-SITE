"use client";

import { FormEvent, useState } from "react";
import { algerianWilayas } from "@/lib/algeria";
import { submitRegistration, type RegistrationPayload } from "@/lib/registrations/submit-registration";
import { type Locale, t } from "@/lib/i18n";

const courseNames: Record<string, Record<Locale, string>> = {
  "formation-de-formateurs-tot": { fr: "Formation de Formateurs — TOT", ar: "تكوين المدربين — TOT" },
  "agent-de-voyage": { fr: "Agent de Voyage & Gestion d’Agence", ar: "وكيل سفر وتسيير وكالة" },
  photographie: { fr: "Formation Professionnelle en Photographie", ar: "التكوين المهني في التصوير" },
  "educatrice-enfants-gerante-creche": { fr: "Petite Enfance — Formation 5 en 1", ar: "الطفولة المبكرة — 5 تكوينات في تكوين واحد" },
  "ecommerce-marketing-digital": { fr: "E-commerce & Digital Marketing", ar: "التجارة الإلكترونية والتسويق الرقمي" },
};

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}{required ? " *" : ""}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 rounded-xl border border-ink/15 bg-background px-3 font-normal" /></label>;
}

function Select({ label, value, options, onChange, required = false, placeholder }: { label: string; value: string; options: readonly (string | { value: string; label: string })[]; onChange: (value: string) => void; required?: boolean; placeholder: string }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}{required ? " *" : ""}<select required={required} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 rounded-xl border border-ink/15 bg-background px-3 font-normal"><option value="">{placeholder}</option>{options.map((option) => { const item = typeof option === "string" ? { value: option, label: option } : option; return <option key={item.value} value={item.value}>{item.label}</option>; })}</select></label>;
}

export function LocalizedRegistrationForm({ locale, courseSlug }: { locale: Locale; courseSlug?: string }) {
  const s = t[locale];
  const [values, setValues] = useState({ name: "", phone: "", email: "", wilaya: "", course: courseSlug ?? "", mode: "presentiel", message: "", consent: false });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const update = (key: string, value: string | boolean) => setValues((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const phone = values.phone.replace(/[\s().-]/g, "");
    if (values.name.trim().length < 2 || !/^(?:\+213|0)(?:5|6|7)\d{8}$/.test(phone) || !values.wilaya || !values.course || !values.consent) { setError(s.required); return; }
    const payload: RegistrationPayload = { fullName: values.name, phone: values.phone, email: values.email || undefined, wilaya: values.wilaya, formation: values.course, courseName: courseNames[values.course]?.[locale] ?? values.course, studyMode: values.mode, message: values.message || undefined, consent: true, status: "new", sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined };
    try { const result = await submitRegistration(payload); if (!result.ok) throw new Error(); setSent(true); } catch { setError(s.error); }
  }
  if (sent) return <div className="rounded-3xl border border-gold/30 bg-gold/10 p-8"><h2 className="text-3xl font-semibold">{locale === "fr" ? "Votre demande est enregistrée ✓" : "تم تسجيل طلبك ✓"}</h2><p className="mt-4">{locale === "fr" ? "Merci. Nous vous contacterons prochainement." : "شكرًا لك. سنتواصل معك قريبًا."}</p></div>;
  const courseOptions = Object.keys(courseNames).map((value) => ({ value, label: courseNames[value][locale] }));
  return <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-ink/10 bg-white p-6 shadow-xl"><Field label={s.fullName} value={values.name} onChange={(value) => update("name", value)} required /><Field label={s.phone} value={values.phone} onChange={(value) => update("phone", value)} required /><Field label={s.email} value={values.email} onChange={(value) => update("email", value)} /><Select label={s.wilaya} value={values.wilaya} options={algerianWilayas} onChange={(value) => update("wilaya", value)} required placeholder={s.choose} /><Select label={s.navCourses} value={values.course} options={courseOptions} onChange={(value) => update("course", value)} required placeholder={s.choose} /><Select label={s.mode} value={values.mode} options={[{ value: "presentiel", label: s.presentiel }, { value: "online", label: s.online }]} onChange={(value) => update("mode", value)} placeholder={s.choose} /><label className="grid gap-2 text-sm font-semibold">{s.message}<textarea value={values.message} onChange={(event) => update("message", event.target.value)} rows={4} className="rounded-xl border border-ink/15 bg-background p-3" /></label><label className="flex gap-3 text-sm"><input type="checkbox" checked={values.consent} onChange={(event) => update("consent", event.target.checked)} />{s.consent}</label>{error && <p className="text-sm text-red-700">{error}</p>}<button className="min-h-12 rounded-full bg-ink px-6 font-semibold text-white">{s.submitRegistration} ↗</button></form>;
}
