import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "ELIVA SCHOOL — Les compétences qui créent des opportunités",
  description: "Formations pratiques, formateurs de terrain et accompagnement professionnel pour passer de la théorie à l’action.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-eliva-locale") === "ar" ? "ar" : "fr";
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}><body>{children}</body></html>;
}
