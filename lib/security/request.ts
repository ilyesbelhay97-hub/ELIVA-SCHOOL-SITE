export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin || referer;
  if (!candidate) return true;
  try {
    const requestHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host");
    return Boolean(requestHost && new URL(candidate).host === requestHost);
  } catch {
    return false;
  }
}
