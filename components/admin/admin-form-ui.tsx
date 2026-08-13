"use client";

export function AdminDrawer({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true" aria-label={title}><button className="absolute inset-0 cursor-default" aria-label="Fermer" onClick={onClose} /><aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-background p-6 shadow-2xl sm:p-8"><div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold tracking-[-0.04em]">{title}</h2><button onClick={onClose} className="min-h-11 min-w-11 rounded-full border border-ink/15 text-xl" aria-label="Fermer">×</button></div><div className="mt-6">{children}</div></aside></div>;
}

export function AdminToast({ message, kind = "success", onClose }: { message: string; kind?: "success" | "error"; onClose: () => void }) {
  return <div className={`${kind === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-gold/30 bg-gold/10 text-ink"} fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-4 rounded-2xl border p-4 text-sm shadow-xl`} role="status"><span>{message}</span><button onClick={onClose} aria-label="Fermer">×</button></div>;
}

export function FormInput({ label, value, onChange, type = "text", required = false, placeholder, min, max }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; min?: string; max?: string }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}{required ? " *" : ""}<input type={type} required={required} value={value} min={min} max={max} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-xl border border-ink/15 bg-white px-3 text-sm font-normal outline-none focus:border-ink focus:ring-2 focus:ring-gold/40" /></label>;
}
