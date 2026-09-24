"use client";

import { FormEvent, useRef, useState } from "react";
import { algerianWilayas } from "@/lib/algeria";
import { Locale, t } from "@/lib/i18n";

type Values = Record<string, string | boolean | string[] | File | undefined>;

export function LocalizedRecruitmentForm({ locale }: { locale: Locale }) {
  const isArabic = locale === "ar";
  const s = t[locale];
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Values>({ training_mode_preferences: [], consent: false });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const copy = isArabic ? {
    steps: ["👤 معلوماتك", "🎯 خبرتك", "📄 ملفك"], next: "متابعة", previous: "رجوع", submit: "إرسال طلب الانضمام", required: "يرجى إكمال الحقول المطلوبة قبل المتابعة.", consent: "أوافق على حفظ معلوماتي وسيرتي الذاتية.", modes: ["حضوري", "عن بُعد"], availability: ["أيام الأسبوع", "نهاية الأسبوع", "مرن"], choose: "اختر", uploadTitle: "📄 أرفق سيرتك الذاتية", uploadHint: "اضغط لاختيار ملف PDF", replace: "استبدال الملف", selected: "✓ تم اختيار الملف", submitting: "جارٍ إرسال الطلب…", successTitle: "🎉 تم استلام طلبك بنجاح", successBody: "شكرًا لاهتمامك بالانضمام إلى شبكة مدربي Meritify Academy. سيتم مراجعة معلوماتك وملفك المهني، وسنتواصل معك إذا كان ملفك مناسبًا لاحتياجات البرامج التدريبية.", home: "العودة إلى الرئيسية"
  } : {
    steps: ["👤 Profil", "🎯 Expertise", "📄 Dossier"], next: "Continuer", previous: "Retour", submit: "Déposer ma candidature", required: "Complétez les champs obligatoires avant de continuer.", consent: "J’accepte la conservation de mes informations et de mon CV.", modes: ["Présentiel", "En ligne"], availability: ["Semaine", "Week-end", "Flexible"], choose: "Choisir", uploadTitle: "📄 Ajoutez votre CV", uploadHint: "Cliquez pour choisir un fichier PDF", replace: "Remplacer le fichier", selected: "✓ Fichier sélectionné", submitting: "Envoi de la candidature…", successTitle: "🎉 Candidature reçue", successBody: "Merci pour votre intérêt à rejoindre le réseau de formateurs Meritify Academy. Votre profil sera étudié et nous vous contacterons s’il correspond aux besoins de nos programmes.", home: "Retour à l’accueil"
  };
  const messages = isArabic ? { required: "يرجى إدخال هذه المعلومة.", phone: "يرجى إدخال رقم هاتف جزائري صحيح.", email: "يرجى إدخال بريد إلكتروني صحيح.", minBio: "يرجى كتابة نبذة مهنية لا تقل عن 30 حرفًا.", minMotivation: "يرجى كتابة دافع لا يقل عن 30 حرفًا.", modes: "اختر نمط تدريب واحدًا على الأقل.", consent: "يجب الموافقة على حفظ المعلومات والسيرة الذاتية." } : { required: "Veuillez renseigner ce champ.", phone: "Veuillez renseigner un numéro algérien valide.", email: "Veuillez renseigner une adresse e-mail valide.", minBio: "Veuillez renseigner une présentation d’au moins 30 caractères.", minMotivation: "Veuillez renseigner une motivation d’au moins 30 caractères.", modes: "Choisissez au moins un mode de formation.", consent: "Votre consentement est nécessaire." };
  const set = (key: string, value: Values[string]) => { setValues((current) => ({ ...current, [key]: value })); setError(""); setFieldErrors((current) => ({ ...current, [key]: "" })); };
  const requiredByStep = step === 1 ? ["full_name", "phone", "email", "wilaya", "current_job"] : step === 2 ? ["specialty", "years_experience", "professional_bio", "courses_can_teach", "skills", "languages"] : ["available_wilayas", "availability", "motivation", "cv"];
  function validateStep(stepToValidate = step) {
    const errors: Record<string, string> = {};
    const fields = stepToValidate === 1 ? requiredByStep : stepToValidate === 2 ? requiredByStep : requiredByStep;
    fields.forEach((key) => {
      if (key === "cv" ? !values.cv : !String(values[key] ?? "").trim()) errors[key] = messages.required;
    });
    if (stepToValidate === 1 && !/^(?:\+213|0)(?:5|6|7)\d{8}$/.test(String(values.phone ?? "").replace(/[\s().-]/g, ""))) errors.phone = messages.phone;
    if (stepToValidate === 1 && values.email && !/^\S+@\S+\.\S+$/.test(String(values.email))) errors.email = messages.email;
    if (stepToValidate === 2 && String(values.professional_bio ?? "").trim().length < 30) errors.professional_bio = messages.minBio;
    if (stepToValidate === 3 && String(values.motivation ?? "").trim().length < 30) errors.motivation = messages.minMotivation;
    if (stepToValidate === 3 && !(values.training_mode_preferences as string[] | undefined)?.length) errors.training_mode_preferences = messages.modes;
    if (stepToValidate === 3 && !values.consent) errors.consent = messages.consent;
    setFieldErrors(errors);
    const first = Object.keys(errors)[0];
    if (first) { setError(copy.required); requestAnimationFrame(() => { const element = document.getElementById(first); element?.focus(); element?.scrollIntoView({ behavior: "smooth", block: "center" }); }); return false; }
    setError(""); return true;
  }
  function next() { if (!validateStep()) return; setStep((current) => Math.min(3, current + 1)); }
  function chooseFile(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) { setError(isArabic ? "يرجى اختيار ملف PDF فقط." : "Veuillez choisir un fichier PDF uniquement."); return; }
    if (file.size > 5 * 1024 * 1024) { setError(isArabic ? "حجم الملف يجب ألا يتجاوز 5 ميغابايت." : "Le fichier ne doit pas dépasser 5 Mo."); return; }
    set("cv", file);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep()) return;
    setSubmitting(true); setError("");
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => { if (key !== "cv" && key !== "training_mode_preferences" && key !== "consent" && typeof value !== "boolean" && !(value instanceof File)) form.set(key, String(value ?? "")); });
    const rawPhone = String(values.phone ?? "").replace(/[\s().-]/g, "");
    form.set("phone", rawPhone.startsWith("0") ? `+213${rawPhone.slice(1)}` : rawPhone);
    const modeLabels: Record<string, string> = { presentiel: "Présentiel", online: "En ligne" };
    (values.training_mode_preferences as string[]).forEach((mode) => form.append("training_mode_preferences", modeLabels[mode] ?? mode));
    const availabilityLabels: Record<string, string> = { weekday: "Semaine", weekend: "Week-end", flexible: "Flexible" };
    form.set("availability", availabilityLabels[String(values.availability)] ?? String(values.availability ?? "")); form.set("consent", "true"); form.set("website", String(values.website ?? "")); form.set("has_training_experience", String(values.has_training_experience ?? "no")); form.set("cv", values.cv as File);
    try {
      const response = await fetch("/api/trainer-recruitment", { method: "POST", body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(isArabic ? "تعذر إرسال الطلب. يرجى التحقق من المعلومات والمحاولة مرة أخرى." : result.error ?? s.error); setSubmitting(false); return; }
      setDone(true);
    } catch { setError(s.error); setSubmitting(false); }
  }
  if (done) return <div className="motion-reveal rounded-3xl border border-gold/40 bg-gold/10 p-8 shadow-xl" role="status"><div className="mb-5 grid size-16 place-items-center rounded-full bg-gold text-3xl text-ink">✓</div><h2 className="text-3xl font-semibold">{copy.successTitle}</h2><p className="mt-5 leading-8 text-ink/70">{copy.successBody}</p><a href={`/${locale}`} className="mt-7 inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-semibold text-white">{copy.home} ↗</a></div>;
  return <form onSubmit={submit} className="rounded-[2rem] border border-gold/25 bg-white p-6 shadow-[0_20px_70px_rgba(11,31,58,.12)] sm:p-9" noValidate>
    <div className="flex flex-col gap-5 border-b border-ink/10 pb-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow text-gold-dark">{s.step} {step} / 3</p><h2 className="mt-2 text-2xl font-semibold">{copy.steps[step - 1]}</h2></div><div className="flex gap-2" aria-label={isArabic ? "تقدم الطلب" : "Progression de la candidature"}>{[1, 2, 3].map((item) => <span key={item} className={`h-2 flex-1 rounded-full transition-all duration-500 sm:w-16 ${item <= step ? "bg-gold" : "bg-ink/10"}`} />)}</div></div>
    {step === 1 && <div className="mt-8 grid gap-4 sm:grid-cols-2"><Field label={s.fullName} name="full_name" values={values} set={set} error={fieldErrors.full_name} required /><Field label={s.phone} name="phone" values={values} set={set} error={fieldErrors.phone} required /><Field label={s.email} name="email" type="email" values={values} set={set} error={fieldErrors.email} required /><SelectField label={s.wilaya} name="wilaya" values={values} set={set} options={algerianWilayas} error={fieldErrors.wilaya} required choose={copy.choose} /><Field label={isArabic ? "المدينة / البلدية" : "Ville / Commune"} name="city" values={values} set={set} /><Field label={isArabic ? "المهنة الحالية" : "Fonction / métier actuel"} name="current_job" values={values} set={set} error={fieldErrors.current_job} required /></div>}
    {step === 2 && <div className="mt-8 grid gap-4"><Field label={isArabic ? "التخصص الرئيسي" : "Spécialité principale"} name="specialty" values={values} set={set} error={fieldErrors.specialty} required /><Field label={isArabic ? "سنوات الخبرة" : "Années d’expérience"} name="years_experience" values={values} set={set} error={fieldErrors.years_experience} required /><Area label={isArabic ? "نبذة مهنية قصيرة" : "Présentation professionnelle / courte bio"} name="professional_bio" values={values} set={set} error={fieldErrors.professional_bio} required /><Area label={isArabic ? "الدورات أو المواضيع التي يمكنكم تقديمها" : "Formations / sujets que vous pouvez assurer"} name="courses_can_teach" values={values} set={set} error={fieldErrors.courses_can_teach} required /><Area label={isArabic ? "المهارات / الكلمات المفتاحية" : "Compétences / tags"} name="skills" values={values} set={set} error={fieldErrors.skills} required /><Field label={isArabic ? "اللغات المتقنة" : "Langues maîtrisées"} name="languages" values={values} set={set} error={fieldErrors.languages} required /></div>}
    {step === 3 && <div className="mt-8 grid gap-5"><Field label={isArabic ? "ولايات التدخل" : "Wilayas d’intervention"} name="available_wilayas" values={values} set={set} error={fieldErrors.available_wilayas} required /><fieldset><legend className="text-sm font-semibold">{isArabic ? "النمط المفضل" : "Mode préféré"}</legend><div className="mt-3 flex flex-wrap gap-4">{["presentiel", "online"].map((mode, index) => <label key={mode} className="inline-flex items-center gap-2 text-sm"><input id={`mode-${mode}`} type="checkbox" checked={(values.training_mode_preferences as string[]).includes(mode)} onChange={(event) => set("training_mode_preferences", event.target.checked ? [...(values.training_mode_preferences as string[]), mode] : (values.training_mode_preferences as string[]).filter((item) => item !== mode))} />{copy.modes[index]}</label>)}</div>{fieldErrors.training_mode_preferences && <InlineError text={fieldErrors.training_mode_preferences} />}</fieldset><SelectField label={isArabic ? "التوفر" : "Disponibilité"} name="availability" values={values} set={set} options={["weekday", "weekend", "flexible"]} labels={copy.availability} error={fieldErrors.availability} required choose={copy.choose} /><Area label={isArabic ? "الدافع" : "Motivation"} name="motivation" values={values} set={set} error={fieldErrors.motivation} required /><div><p className="text-sm font-semibold">{copy.uploadTitle} *</p><button type="button" onClick={() => inputRef.current?.click()} className="mt-2 flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gold/50 bg-gold/5 p-5 text-center transition hover:bg-gold/10 focus:outline-none focus:ring-2 focus:ring-gold">{values.cv ? <><span className="text-2xl text-gold-dark">✓</span><span className="mt-2 text-sm font-semibold">{copy.selected}</span><span className="mt-1 max-w-full truncate text-xs text-ink/60">{(values.cv as File).name}</span><span className="mt-3 text-xs text-gold-dark">{copy.replace}</span></> : <><span className="text-3xl">📄</span><span className="mt-2 font-semibold">{copy.uploadHint}</span><span className="mt-1 text-xs text-ink/50">PDF · 5 MB</span></>}</button><input id="cv" ref={inputRef} className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(event) => chooseFile(event.target.files?.[0])} />{fieldErrors.cv && <InlineError text={fieldErrors.cv} />}</div><label className="flex items-start gap-3 text-sm"><input id="consent" className="mt-1" type="checkbox" checked={Boolean(values.consent)} onChange={(event) => set("consent", event.target.checked)} />{copy.consent}</label>{fieldErrors.consent && <InlineError text={fieldErrors.consent} />}</div>}
    {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
    <div className="mt-8 flex gap-3">{step > 1 && <button type="button" onClick={() => { setStep((current) => current - 1); setError(""); }} className="min-h-12 rounded-full border border-ink/15 px-5 font-semibold">{copy.previous}</button>}{step < 3 ? <button type="button" onClick={next} className="ms-auto min-h-12 rounded-full bg-ink px-6 font-semibold text-white transition hover:bg-gold hover:text-ink">{copy.next} ↗</button> : <button type="submit" disabled={submitting} className="ms-auto min-h-12 rounded-full bg-ink px-6 font-semibold text-white transition hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-60">{submitting ? copy.submitting : copy.submit} ↗</button>}</div>
  </form>;
}

function InlineError({ text }: { text?: string }) { return text ? <span className="text-xs font-normal text-red-700" role="alert">{text}</span> : null; }
function Field({ label, name, values, set, required = false, type = "text", error }: { label: string; name: string; values: Values; set: (key: string, value: Values[string]) => void; required?: boolean; type?: string; error?: string }) { return <label className="grid gap-2 text-sm font-semibold" htmlFor={name}>{label}{required && " *"}<input id={name} name={name} required={required} type={type} value={String(values[name] ?? "")} onChange={(event) => set(name, event.target.value)} aria-invalid={Boolean(error)} className="min-h-12 rounded-xl border border-ink/15 bg-background px-3 font-normal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20" /><InlineError text={error} /></label>; }
function Area({ label, name, values, set, required = false, error }: { label: string; name: string; values: Values; set: (key: string, value: Values[string]) => void; required?: boolean; error?: string }) { return <label className="grid gap-2 text-sm font-semibold" htmlFor={name}>{label}{required && " *"}<textarea id={name} name={name} required={required} rows={4} value={String(values[name] ?? "")} onChange={(event) => set(name, event.target.value)} aria-invalid={Boolean(error)} className="rounded-xl border border-ink/15 bg-background p-3 font-normal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20" /><InlineError text={error} /></label>; }
function SelectField({ label, name, values, set, options, labels, required = false, choose, error }: { label: string; name: string; values: Values; set: (key: string, value: Values[string]) => void; options: readonly string[]; labels?: readonly string[]; required?: boolean; choose: string; error?: string }) { return <label className="grid gap-2 text-sm font-semibold" htmlFor={name}>{label}{required && " *"}<select id={name} name={name} required={required} value={String(values[name] ?? "")} onChange={(event) => set(name, event.target.value)} aria-invalid={Boolean(error)} className="min-h-12 rounded-xl border border-ink/15 bg-background px-3 font-normal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"><option value="">{choose}</option>{options.map((option, index) => <option key={option} value={option}>{labels?.[index] ?? option}</option>)}</select><InlineError text={error} /></label>; }
