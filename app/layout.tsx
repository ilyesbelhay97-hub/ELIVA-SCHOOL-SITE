import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

function getMetadataBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    try {
      return new URL(configuredUrl);
    } catch {
      // Keep builds resilient when a Vercel environment variable is empty or malformed.
    }
  }

  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "ELIVA SCHOOL — Les compétences qui créent des opportunités",
  description: "Formations pratiques, formateurs de terrain et accompagnement professionnel pour passer de la théorie à l’action.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-eliva-locale") === "ar" ? "ar" : "fr";
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}><body>{children}</body></html>;
}
