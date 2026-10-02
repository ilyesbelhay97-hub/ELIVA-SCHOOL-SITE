import Link from "next/link";
import { getLmsContext, localizedValue } from "@/lib/lms";

type StudentCourse = { id: string; title: string | null; excerpt: string | null; cover_url: string | null; slug: string | null };
type StudentEnrollment = { id: string; course_id: string; status: string; access_ends_at: string | null; courses: StudentCourse | null };
type StudentLive = { id: string; course_id: string; title_fr: string | null; title_ar: string | null; starts_at: string; ends_at: string | null; provider: string | null };

export default async function StudentDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "ar" ? "ar" : "fr";
  const ar = locale === "ar";
  const { supabase, user, profile, role } = await getLmsContext();

  if (!user) {
    return <main dir={ar ? "rtl" : "ltr"} className="section-shell flex min-h-screen items-center justify-center py-20"><div className="max-w-xl rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-sm"><p className="eyebrow text-gold-dark">{ar ? "مساحتي التعليمية" : "Mon espace"}</p><h1 className="mt-3 text-3xl font-semibold text-ink">{ar ? "الوصول إلى بوابة الطالب" : "Accès au portail étudiant"}</h1><p className="mt-4 text-ink/60">{ar ? "سجّل الدخول لمتابعة دوراتك ودروسك." : "Connectez-vous pour retrouver vos formations et vos leçons."}</p><Link href={`/${locale}/login`} className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 font-semibold text-white">{ar ? "تسجيل الدخول" : "Se connecter"}</Link></div></main>;
  }

  if (!profile || !profile.active || !role || !["student", "admin"].includes(role)) {
    return <main dir={ar ? "rtl" : "ltr"} className="section-shell flex min-h-screen items-center justify-center py-20"><div className="max-w-xl rounded-3xl border border-ink/10 bg-white p-8 text-center shadow-sm"><p className="eyebrow text-gold-dark">{ar ? "مساحتي التعليمية" : "Mon espace"}</p><h1 className="mt-3 text-3xl font-semibold text-ink">{ar ? "الحساب غير مفعّل بعد" : "Compte LMS non activé"}</h1><p className="mt-4 text-ink/60">{ar ? "لم يتم تفعيل ملفك التعليمي بعد. يرجى التواصل مع الإدارة." : "Votre profil étudiant n’est pas encore activé. Veuillez contacter l’administration."}</p></div></main>;
  }

  const { data: enrollments } = await supabase.from("lms_enrollments").select("id, course_id, status, access_ends_at, courses(id, title, excerpt, cover_url, slug)").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false });
  const { data: lives } = await supabase.from("lms_live_sessions").select("id, course_id, title_fr, title_ar, starts_at, ends_at, provider").gte("starts_at", new Date().toISOString()).order("starts_at").limit(5);
  const studentEnrollments = (enrollments ?? []) as unknown as StudentEnrollment[];
  const studentLives = (lives ?? []) as unknown as StudentLive[];

  return <main dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-background"><header className="border-b border-ink/10 bg-ink px-5 py-5 text-white"><div className="mx-auto flex max-w-6xl items-center justify-between"><Link href={`/${locale}`} className="font-semibold tracking-[0.08em]">Meritify <span className="text-gold">ACADEMY</span></Link><form action="/api/lms/logout" method="post"><button className="text-sm text-white/70">{ar ? "تسجيل الخروج" : "Se déconnecter"}</button></form></div></header><section className="mx-auto max-w-6xl px-5 py-12 sm:py-16"><p className="eyebrow text-gold-dark">{ar ? "مساحتي التعليمية" : "Mon espace"}</p><h1 className="mt-3 text-4xl font-semibold">{ar ? "دوراتي" : "Mes formations"}</h1><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{studentEnrollments.map((item) => { const course = item.courses; if (!course) return <div key={item.id} className="rounded-3xl border border-ink/10 bg-white p-5"><h2 className="text-xl font-semibold">{ar ? "الدورة غير متاحة مؤقتًا" : "Formation temporairement indisponible"}</h2><p className="mt-2 text-sm text-ink/60">{ar ? "سيظهر محتوى الدورة بعد تفعيل نشرها." : "Le contenu apparaîtra dès que la formation sera publiée."}</p></div>; return <Link key={item.id} href={`/${locale}/student/courses/${course.id}`} className="overflow-hidden rounded-3xl border border-ink/10 bg-white transition hover:-translate-y-1"><div className="aspect-[16/9] bg-ink/5">{course.cover_url && <img src={course.cover_url} alt="" className="h-full w-full object-cover" />}</div><div className="p-5"><h2 className="text-xl font-semibold">{course.title}</h2><p className="mt-2 text-sm text-ink/60">{course.excerpt}</p><span className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">{ar ? "فتح الدورة ↗" : "Ouvrir la formation ↗"}</span></div></Link>; })}</div>{studentEnrollments.length === 0 && <p className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 text-ink/60">{ar ? "لا توجد دورات نشطة مرتبطة بحسابك." : "Aucune formation active n’est encore liée à votre compte."}</p>}<div className="mt-16"><h2 className="text-2xl font-semibold">{ar ? "الحصص القادمة" : "Prochaines sessions en direct"}</h2><div className="mt-5 grid gap-3">{studentLives.map((live) => <div key={live.id} className="rounded-2xl border border-ink/10 bg-white p-5"><p className="font-semibold">{localizedValue(locale, live.title_fr, live.title_ar)}</p><p className="mt-1 text-sm text-ink/60">{new Date(live.starts_at).toLocaleString(locale === "ar" ? "ar-DZ" : "fr-FR")}</p></div>)}</div></div></section></main>;
}
