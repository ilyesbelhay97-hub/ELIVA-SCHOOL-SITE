import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function CoursePreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("courses")
    .select("title_fr,title_ar,short_description_fr,short_description_ar,hero_headline_fr,hero_headline_ar,modules_fr,modules_ar,cover_image_path,publish_status")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-6 sm:p-10">
        <div className="mb-8 flex items-center justify-between">
          <p className="eyebrow text-gold-dark">Prévisualisation privée · {data.publish_status}</p>
          <Link href="/admin/formations" className="text-sm font-semibold text-gold-dark">Retour au CMS ↗</Link>
        </div>
        <div className="grid gap-8 rounded-3xl border border-ink/10 bg-white p-6 shadow-xl sm:p-10">
          <h1 className="text-4xl font-semibold">{data.title_fr}</h1>
          <p dir="rtl" className="text-2xl font-semibold">{data.title_ar}</p>
          {data.cover_image_path && <img src={data.cover_image_path} alt="" className="max-h-96 w-full rounded-2xl object-cover" />}
          <div className="grid gap-6 sm:grid-cols-2">
            <div><p className="eyebrow text-gold-dark">FR</p><p className="mt-3 leading-7 text-ink/70">{data.short_description_fr || data.hero_headline_fr}</p></div>
            <div dir="rtl"><p className="eyebrow text-gold-dark">AR</p><p className="mt-3 leading-7 text-ink/70">{data.short_description_ar || data.hero_headline_ar}</p></div>
          </div>
          <pre className="overflow-auto rounded-2xl bg-sand p-4 text-xs">{JSON.stringify({ modules_fr: data.modules_fr, modules_ar: data.modules_ar }, null, 2)}</pre>
        </div>
      </div>
    </main>
  );
}
