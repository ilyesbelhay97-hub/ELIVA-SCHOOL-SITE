import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELIVA SCHOOL — Les compétences qui créent des opportunités",
  description: "Formations pratiques, formateurs de terrain et accompagnement professionnel pour passer de la théorie à l’action.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
