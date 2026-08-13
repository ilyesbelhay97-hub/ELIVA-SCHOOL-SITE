import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    if (!body.email || !body.password) return NextResponse.json({ error: "E-mail et mot de passe obligatoires." }, { status: 400 });
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: body.email.trim(), password: body.password });
    if (error || !data.session) return NextResponse.json({ error: error?.message ?? "Connexion impossible." }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin login failed:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: process.env.NODE_ENV === "development" ? message : "Service de connexion indisponible." }, { status: 500 });
  }
}
