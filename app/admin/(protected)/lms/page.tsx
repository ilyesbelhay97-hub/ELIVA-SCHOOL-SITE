import { requireAdmin } from "@/lib/supabase/admin";
import LmsAdminPanel from "@/components/admin/lms-admin-panel";

export const dynamic = "force-dynamic";
export default async function AdminLmsPage() { const { supabase } = await requireAdmin(); const [{ data: profiles }, { data: enrollments }, { data: courses }, { data: trainers }] = await Promise.all([supabase.from("lms_profiles").select("user_id,user_type,display_name,active,trainer_id,locale,created_at").order("created_at", { ascending: false }), supabase.from("lms_enrollments").select("id,user_id,course_id,status,access_ends_at,created_at").order("created_at", { ascending: false }), supabase.from("courses").select("id,title,slug").order("title"), supabase.from("trainers").select("id,name,slug").order("name")]); return <LmsAdminPanel profiles={profiles ?? []} enrollments={enrollments ?? []} courses={courses ?? []} trainers={trainers ?? []} />; }
