export function TrustBadge({ number, label }: { number: string; label: string }) {
  return <div className="flex items-center gap-4 border-b border-ink/10 py-5 first:border-l-0 sm:px-5 sm:first:pl-0 sm:nth-[3]:border-l-0 lg:border-b-0 lg:border-l lg:py-7"><span className="font-mono text-xs text-gold-dark">{number}</span><span className="text-sm font-medium text-ink/70">{label}</span></div>;
}
