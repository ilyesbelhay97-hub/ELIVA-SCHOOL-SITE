import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/fr/login";
  return /^\/(fr|ar)\/(login|update-password)(\?.*)?$/.test(value) ? value : "/fr/login";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const supabase = await createClient();
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && (type === "invite" || type === "recovery")
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("Missing authentication callback code.") };
  if (result.error) return NextResponse.redirect(new URL(type === "recovery" ? "/fr/login?recovery_error=1" : "/fr/login?invite_error=1", url.origin));
  return NextResponse.redirect(new URL(next, url.origin));
}
