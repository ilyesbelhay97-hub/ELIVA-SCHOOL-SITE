import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { MetaPixel } from "@/components/analytics/meta-pixel";

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
  title: "Meritify Academy — Les compétences qui créent des opportunités",
  applicationName: "Meritify Academy",
  description: "Formations pratiques, formateurs de terrain et accompagnement professionnel pour passer de la théorie à l’action.",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" }, { url: "/brand/meritify-icon-192.png", type: "image/png", sizes: "192x192" }], apple: "/brand/meritify-icon-192.png" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-eliva-locale") === "ar" ? "ar" : "fr";
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}><body><MetaPixel />{children}</body></html>;
}
