import { redirect } from "next/navigation";
export default async function StudentCourseAlias({ params }: { params: Promise<{ courseId: string }> }) { const { courseId } = await params; redirect(`/fr/student/courses/${courseId}`); }
