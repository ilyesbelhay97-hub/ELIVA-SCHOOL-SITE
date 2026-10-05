import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getTrainerRating(trainerId: string) {
  const supabase = await createClient();
  const result = await supabase.from("trainer_reviews").select("rating").eq("trainer_id", trainerId).eq("status", "approved");
  const ratings = (result.data ?? []).map((row) => Number(row.rating)).filter((rating) => rating >= 1 && rating <= 5);
  return { average_rating: ratings.length ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10 : null, review_count: ratings.length };
}
