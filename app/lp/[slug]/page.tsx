import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseLandingPage } from "@/components/course/course-landing-page";
import { courseDetails, getCourseTrainer } from "@/lib/courses";

type LandingPageProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return courseDetails.map((course) => ({ slug: course.landingSlug })); }
function getLandingCourse(slug: string) { return courseDetails.find((course) => course.landingSlug === slug); }
export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> { const { slug } = await params; const course = getLandingCourse(slug); if (!course) return { title: "Formation introuvable | ELIVA SCHOOL" }; return { title: `${course.title} — ELIVA SCHOOL`, description: course.promise, alternates: { canonical: `/lp/${course.landingSlug}` }, openGraph: { title: course.title, description: course.promise, type: "website", images: [{ url: course.coverImage, alt: course.title }] }, twitter: { card: "summary_large_image", title: course.title, description: course.promise, images: [course.coverImage] } }; }
export default async function LandingPage({ params }: LandingPageProps) { const { slug } = await params; const course = getLandingCourse(slug); if (!course) notFound(); const trainer = getCourseTrainer(course); if (!trainer) notFound(); return <CourseLandingPage course={course} trainer={trainer} />; }
