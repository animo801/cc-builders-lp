"use client";

import { useEffect } from "react";
import { logFunnelEvent, setFunnelDesign } from "./funnel";

// Logs the top of the funnel for a landing page: one "landed" per page load,
// and a "bid_click" whenever any of its "Get your bid" links is clicked.
// `design` tags a redesigned page (see DESIGNS in app/funnel/store.js).
export default function FunnelTracker({ slug, design }) {
  useEffect(() => {
    setFunnelDesign(design);
    logFunnelEvent(slug, "landed");

    function onClick(e) {
      if (e.target.closest?.(`a[href="/bid/${slug}"]`)) logFunnelEvent(slug, "bid_click");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [slug, design]);

  return null;
}
