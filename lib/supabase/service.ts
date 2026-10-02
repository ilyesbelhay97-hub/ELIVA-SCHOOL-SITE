import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type ServiceDatabase = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] }>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let serviceClient: SupabaseClient<ServiceDatabase> | null = null;

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing server-only Supabase configuration.");
  serviceClient ??= createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) as unknown as SupabaseClient<ServiceDatabase>;
  return serviceClient;
}
