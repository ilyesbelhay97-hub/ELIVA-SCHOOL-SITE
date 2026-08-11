type SectionHeadingProps = { eyebrow: string; title: string; description?: string; dark?: boolean; centered?: boolean };

export function SectionHeading({ eyebrow, title, description, dark = false, centered = false }: SectionHeadingProps) {
  return <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl`}>
    <p className={`eyebrow mb-5 ${dark ? "text-gold" : "text-gold-dark"}`}>{eyebrow}</p>
    <h2 className={`text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
    {description && <p className={`mt-5 max-w-xl text-base leading-7 ${dark ? "text-white/60" : "text-ink/60"}`}>{description}</p>}
  </div>;
}
