"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = { locale: "fr" | "ar" };

export default function UpdatePasswordForm({ locale }: Props) {
  const ar = locale === "ar";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [ready, setReady] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const client = createClient();
    let mounted = true;
    void client.auth.getSession().then(({ data }) => { if (mounted) setReady(Boolean(data.session)); });
    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (mounted && (event === "PASSWORD_RECOVERY" || session)) setReady(true);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8 || password !== confirmation) {
      setError(ar ? "اختر كلمة مرور من 8 أحرف على الأقل وتأكد من تطابقها." : "Choisissez un mot de passe d’au moins 8 caractères et confirmez-le.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setError(ar ? "انتهت صلاحية الرابط أو تعذر تحديث كلمة المرور." : "Le lien a expiré ou la mise à jour du mot de passe a échoué.");
      setBusy(false);
      return;
    }
    const response = await fetch("/api/lms/me");
    const data = await response.json().catch(() => ({})) as { role?: string; redirect?: string };
    window.location.assign(data.redirect ?? `/${locale}/login?reset=success`);
  }

  return <main dir={ar ? "rtl" : "ltr"} className="grid min-h-screen place-items-center bg-ink px-5 py-10 text-ink"><div className="w-full max-w-md rounded-3xl bg-background p-7 shadow-2xl sm:p-10"><p className="font-semibold tracking-[0.08em]">Meritify <span className="text-gold-dark">ACADEMY</span></p><p className="eyebrow mt-12 text-gold-dark">{ar ? "أمان الحساب" : "Sécurité du compte"}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em]">{ar ? "كلمة المرور الجديدة" : "Nouveau mot de passe"}</h1><p className="mt-4 text-sm leading-6 text-ink/60">{ar ? "اختر كلمة مرور جديدة وآمنة." : "Choisissez un nouveau mot de passe sécurisé."}</p>{ready === false && <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{ar ? "رابط الاستعادة غير صالح أو منتهي الصلاحية." : "Le lien de récupération est invalide ou expiré."}</p>}{ready !== false && <form onSubmit={submit} className="mt-8 grid gap-5"><label className="grid gap-2 text-sm font-semibold">{ar ? "كلمة المرور الجديدة" : "Nouveau mot de passe"}<input className="min-h-12 rounded-xl border border-ink/15 bg-white px-4 font-normal" type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" /></label><label className="grid gap-2 text-sm font-semibold">{ar ? "تأكيد كلمة المرور" : "Confirmer le mot de passe"}<input className="min-h-12 rounded-xl border border-ink/15 bg-white px-4 font-normal" type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} required minLength={8} autoComplete="new-password" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<button disabled={busy || ready === null} className="min-h-12 rounded-full bg-ink px-6 text-sm font-semibold text-white disabled:opacity-60">{busy ? (ar ? "جارٍ التحديث…" : "Mise à jour…") : (ar ? "تحديث كلمة المرور" : "Mettre à jour le mot de passe")}</button></form>}</div></main>;
}
