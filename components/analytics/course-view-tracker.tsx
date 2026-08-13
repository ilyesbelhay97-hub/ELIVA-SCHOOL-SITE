"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export function CourseViewTracker({ courseSlug }: { courseSlug: string }) {
  useEffect(() => { track("view_course", { course: courseSlug }); }, [courseSlug]);
  return null;
}
