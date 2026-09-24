import type { DetailedCourseModule } from "@/lib/course-content";

function moduleEmoji(title: string) {
  const value = title.toLowerCase();
  if (value.includes("e-commerce") || value.includes("تجارة") || value.includes("boutique") || value.includes("متجر")) return "🛒";
  if (value.includes("recherche") || value.includes("بحث") || value.includes("niche")) return "🔍";
  if (value.includes("sourcing") || value.includes("توريد")) return "📦";
  if (value.includes("branding") || value.includes("علامة")) return "🏷️";
  if (value.includes("contenu") || value.includes("محتوى")) return "🎨";
  if (value.includes("photo") || value.includes("تصوير") || value.includes("appareil") || value.includes("كاميرا")) return "📷";
  if (value.includes("lumière") || value.includes("ضوء")) return "💡";
  if (value.includes("prise de parole") || value.includes("تحدث")) return "🎤";
  if (value.includes("groupe") || value.includes("مجموعة")) return "👥";
  if (value.includes("temps") || value.includes("وقت")) return "⏱️";
  if (value.includes("intelligence") || value.includes("الذكاء")) return "🤖";
  if (value.includes("analyse") || value.includes("تحليل")) return "📊";
  if (value.includes("vente") || value.includes("بيع")) return "🤝";
  return "🧩";
}

export function CourseProgram({ modules, rtl = false }: { modules: DetailedCourseModule[]; rtl?: boolean }) {
  return (
    <div className="divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-white">
      {modules.map((item, index) => (
        <details key={item.title} className="group p-5 open:bg-sand/50 sm:p-7">
          <summary className="flex cursor-pointer list-none items-start gap-4 [&::-webkit-details-marker]:hidden">
            <span className="shrink-0 font-mono text-sm text-gold-dark">{String(index + 1).padStart(2, "0")}</span>
            <span className="flex-1 text-lg font-semibold leading-7"><span className="me-2" aria-hidden>{moduleEmoji(item.title)}</span>{item.title}</span>
            <span className="text-2xl font-light text-ink/40 transition-transform duration-300 group-open:rotate-45" aria-hidden>+</span>
          </summary>
          <div className={`pt-4 ${rtl ? "pr-10" : "pl-10"}`}>
            <p className="text-sm leading-7 text-ink/65">{item.description}</p>
            {item.lessons.length > 0 && <ul className="mt-4 grid gap-2 text-sm text-ink/70 sm:grid-cols-2">{(rtl && !/[\u0600-\u06FF]/.test(item.lessons.join(" ")) ? ["المفاهيم الأساسية", "أمثلة تطبيقية", "تمارين عملية"] : item.lessons).map((lesson) => <li key={lesson} className="flex gap-2"><span className="text-gold-dark" aria-hidden>✦</span><span>{lesson}</span></li>)}</ul>}
          </div>
        </details>
      ))}
    </div>
  );
}
