import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) { const { user } = await requireAdmin(); return <AdminShell email={user.email}>{children}</AdminShell>; }
