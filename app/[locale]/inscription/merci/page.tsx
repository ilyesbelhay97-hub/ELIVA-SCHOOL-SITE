import { notFound } from "next/navigation";
import Link from "next/link";
import { LocaleFooter } from "@/components/i18n/locale-footer";
import { LocaleNavbar } from "@/components/i18n/locale-navbar";
import { isLocale, t } from "@/lib/i18n";

export default async function RegistrationThankYou({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const s = t[locale];
  return <><LocaleNavbar locale={locale} /><main className="section-shell flex min-h-[60vh] items-center justify-center py-20"><div className="max-w-xl rounded-3xl border border-gold/30 bg-white p-10 text-center shadow-xl"><div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-gold text-ink text-2xl">✓</div><h1 className="text-4xl font-semibold">{locale === "fr" ? "Votre demande est enregistrée" : "تم تسجيل طلبك بنجاح"}</h1><p className="mt-4 text-lg text-ink/70">{locale === "fr" ? "Merci. Notre équipe vous contactera prochainement pour confirmer les prochaines étapes." : "شكرًا لك. سيتواصل معك فريقنا قريبًا لتأكيد الخطوات القادمة."}</p><Link href={"/" + locale + "/formations"} className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-6 font-semibold text-white">{s.navCourses}</Link></div></main><LocaleFooter locale={locale} /></>;
}
