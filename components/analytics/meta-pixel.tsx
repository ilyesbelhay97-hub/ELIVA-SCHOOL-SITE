"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackMetaEvent } from "@/lib/analytics/meta";
import { getAttribution } from "@/lib/analytics/attribution";

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

export function MetaPixel() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const isPrivate = pathname.startsWith("/admin") || pathname.startsWith("/api");

  useEffect(() => {
    if (isPrivate || !pixelId) return;
    getAttribution();
    if (previousPath.current === null) { previousPath.current = pathname; return; }
    if (previousPath.current !== pathname && ready) {
      trackMetaEvent("PageView");
      previousPath.current = pathname;
    }
  }, [isPrivate, pathname, ready]);

  if (!pixelId || isPrivate) return null;
  return <>
    <Script id="meritify-meta-pixel-bootstrap" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');` }} />
    <Script id="meritify-meta-pixel-loader" strategy="afterInteractive" src="https://connect.facebook.net/en_US/fbevents.js" onLoad={() => { if (typeof window.fbq === "function") { window.fbq("init", pixelId); window.fbq("track", "PageView"); setReady(true); } }} />
  </>;
}
