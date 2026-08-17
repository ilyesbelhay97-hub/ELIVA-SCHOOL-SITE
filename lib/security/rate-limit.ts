import "server-only";
import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

type RateLimitResult = { allowed: boolean; unavailable?: boolean };

function fingerprint(value: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "development-only-rate-limit-key";
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}

export async function consumeRateLimit(namespace: string, identifier: string, windowSeconds: number, maxRequests: number): Promise<RateLimitResult> {
  try {
    const result = await (createServiceClient() as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<{ error: unknown; data: unknown }> }).rpc("consume_api_rate_limit", {
      p_key: `${namespace}:${fingerprint(identifier)}`,
      p_window_seconds: windowSeconds,
      p_max_requests: maxRequests,
    });
    if (result.error) return { allowed: false, unavailable: true };
    return { allowed: result.data === true };
  } catch {
    return { allowed: false, unavailable: true };
  }
}

export function requestIdentifier(request: Request, suffix = "") {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return suffix ? `${address}:${suffix}` : address;
}
