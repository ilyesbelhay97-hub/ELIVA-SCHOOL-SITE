import UpdatePasswordForm from "@/components/auth/update-password-form";

export default async function UpdatePasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  return <UpdatePasswordForm locale={rawLocale === "ar" ? "ar" : "fr"} />;
}
