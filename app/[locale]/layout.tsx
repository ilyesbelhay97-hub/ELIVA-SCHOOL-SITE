import { notFound } from "next/navigation"; import { isLocale, Locale } from "@/lib/i18n";
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<Record<string, string>> }) { const { locale }=await params; if(!isLocale(locale)) notFound(); return <div dir={locale==="ar"?"rtl":"ltr"} className="min-h-screen">{children}</div>; }
