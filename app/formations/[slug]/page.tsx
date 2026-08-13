import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoursePage } from "@/components/course/course-page";
import { getCourseBySlug, getCourseTrainer, courseDetails } from "@/lib/courses";

type CoursePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return courseDetails.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Formation introuvable | ELIVA SCHOOL" };
  return {
    title: `${course.title} | ELIVA SCHOOL`,
    description: course.promise,
    alternates: { canonical: `/formations/${course.slug}` },
    openGraph: { title: course.title, description: course.promise, type: "article", images: [{ url: course.coverImage, alt: course.title }] },
    twitter: { card: "summary_large_image", title: course.title, description: course.promise },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();
  const trainer = getCourseTrainer(course);
  if (!trainer) notFound();
  return <CoursePage course={course} trainer={trainer} />;
}
