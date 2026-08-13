import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/") return NextResponse.redirect(new URL("/fr", request.url));
  const legacyPrefixes: Record<string, string> = {
    "/formations": "/fr/formations",
    "/formateurs": "/fr/formateurs",
    "/inscription": "/fr/inscription",
    "/rejoignez-nous/formateur": "/fr/rejoignez-nous/formateur",
  };
  for (const [prefix, target] of Object.entries(legacyPrefixes)) {
    if (pathname === prefix || pathname.startsWith("/" + prefix.slice(1) + "/")) {
      const suffix = pathname.slice(prefix.length);
      return NextResponse.redirect(new URL(target + suffix, request.url));
    }
  }
  const locale = pathname.split("/")[1];
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-eliva-locale", locale === "ar" ? "ar" : "fr");
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  if (!pathname.startsWith("/admin")) return response;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        requestHeaders.set("cookie", request.cookies.toString());
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = { matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"] };
