import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/fr/login";
  return value.startsWith("/fr/") || value.startsWith("/ar/") ? value : "/fr/login";
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
    : tokenHash && type === "invite"
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" })
      : { error: new Error("Missing authentication callback code.") };
  if (result.error) return NextResponse.redirect(new URL("/fr/login?invite_error=1", url.origin));
  return NextResponse.redirect(new URL(next, url.origin));
}
