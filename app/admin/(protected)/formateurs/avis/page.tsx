import { requireAdmin } from "@/lib/supabase/admin";
import TrainerReviewsAdmin from "@/components/admin/trainer-reviews-admin";
export default async function TrainerReviewsPage() { await requireAdmin(); return <TrainerReviewsAdmin />; }
