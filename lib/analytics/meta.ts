export type MetaValue = string | number | boolean | string[];
export type MetaParams = Record<string, MetaValue | undefined>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function clean(params: MetaParams) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));
}

export function trackMetaEvent(event: string, params: MetaParams = {}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;
  try {
    window.fbq("track", event, clean(params));
    return true;
  } catch {
    return false;
  }
}

export function trackMetaCustomEvent(event: string, params: MetaParams = {}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return false;
  try {
    window.fbq("trackCustom", event, clean(params));
    return true;
  } catch {
    return false;
  }
}
