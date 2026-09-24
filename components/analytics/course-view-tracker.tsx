"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";
import { trackMetaEvent } from "@/lib/analytics/meta";

export function CourseViewTracker({ courseSlug, courseName, locale }: { courseSlug: string; courseName?: string; locale?: string }) {
  useEffect(() => {
    track("view_course", { course: courseSlug });
    trackMetaEvent("ViewContent", { content_name: courseName ?? courseSlug, content_category: "formation", content_ids: [courseSlug], content_type: "product", locale: locale ?? document.documentElement.lang });
  }, [courseName, courseSlug, locale]);
  return null;
}
