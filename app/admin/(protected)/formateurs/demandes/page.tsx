import { requireAdmin } from "@/lib/supabase/admin";
import TrainerProfileRequests from "@/components/admin/trainer-profile-requests";

export const dynamic = "force-dynamic";
export default async function TrainerProfileRequestsPage() { await requireAdmin(); return <TrainerProfileRequests/>; }
