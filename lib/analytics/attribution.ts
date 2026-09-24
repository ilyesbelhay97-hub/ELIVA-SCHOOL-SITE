const storageKey = "meritify-attribution-v1";
const queryKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function getAttribution() {
  if (typeof window === "undefined") return {};
  let stored: Record<string, string | undefined> = {};
  try { stored = JSON.parse(sessionStorage.getItem(storageKey) ?? "{}"); } catch { stored = {}; }
  const params = new URLSearchParams(window.location.search);
  const next = { ...stored };
  queryKeys.forEach((key) => { const value = params.get(key); if (value) next[key] = value; });
  if (!next.referrer && document.referrer) next.referrer = document.referrer;
  try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Attribution is optional. */ }
  return { referrer: next.referrer, utmSource: next.utm_source, utmMedium: next.utm_medium, utmCampaign: next.utm_campaign, utmContent: next.utm_content, utmTerm: next.utm_term };
}
