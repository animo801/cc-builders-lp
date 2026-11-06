"use client";

import { useEffect } from "react";
import { logFunnelEvent } from "./funnel";

// Logs the top of the funnel for a landing page: one "landed" per page load,
// and a "bid_click" whenever any of its "Get your bid" links is clicked.
export default function FunnelTracker({ slug }) {
  useEffect(() => {
    logFunnelEvent(slug, "landed");

    function onClick(e) {
      if (e.target.closest?.(`a[href="/bid/${slug}"]`)) logFunnelEvent(slug, "bid_click");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [slug]);

  return null;
}
