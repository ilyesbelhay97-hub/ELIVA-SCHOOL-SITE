"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), password }) });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "La session Supabase n’a pas pu être créée.");
      setLoading(false);
      return;
    }
    window.location.assign("/admin");
  }

  return <main className="grid min-h-screen place-items-center bg-ink px-5 py-10"><div className="w-full max-w-md rounded-3xl bg-background p-7 shadow-2xl sm:p-10"><Link href="/" className="text-sm font-semibold tracking-[0.08em] text-ink">ELIVA <span className="text-gold-dark">SCHOOL</span></Link><p className="eyebrow mt-12 text-gold-dark">Espace privé</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em]">Connexion admin</h1><p className="mt-4 text-sm leading-6 text-ink/60">Connectez-vous avec un compte Supabase autorisé pour accéder au CRM.</p><form onSubmit={submit} className="mt-8 grid gap-5"><label className="grid gap-2 text-sm font-semibold">E-mail<input className="min-h-12 rounded-xl border border-ink/15 bg-white px-4 font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold/40" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label className="grid gap-2 text-sm font-semibold">Mot de passe<input className="min-h-12 rounded-xl border border-ink/15 bg-white px-4 font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold/40" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<button disabled={loading} className="min-h-12 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-gold disabled:opacity-60">{loading ? "Connexion…" : "Se connecter ↗"}</button></form></div></main>;
}
