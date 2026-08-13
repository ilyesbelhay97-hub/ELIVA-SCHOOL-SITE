"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track, type TrackingEvent } from "@/lib/analytics/track";

export function TrackedLink({ href, event, course, className, children }: { href: string; event: TrackingEvent; course?: string; className: string; children: ReactNode }) {
  return <Link href={href} className={className} onClick={() => track(event, { course })}>{children}</Link>;
}
