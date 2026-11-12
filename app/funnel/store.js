// Redis layout for the funnel, shared by /api/funnel-event (writes) and
// /funnel (reads). Server only.
//
// Each event is a Redis set of the session ids that fired it, so the set's
// size is the number of unique sessions at that step. Every event is written
// twice: to an all-time set and to that day's set. The date filters on
// /funnel union the daily sets, so a session active on several days still
// counts once. Keys start with `cc:` so the store could be shared safely.

// Which timezone a "day" starts in for the date filters.
export const FUNNEL_TIMEZONE = "America/Denver";

export function funnelKey(name, day) {
  return day ? `cc:funnel:${day}:${name}` : `cc:funnel:${name}`;
}

// Events are stored per landing page: `remodels:landed`, `adus:plans=No, not yet`.
export function pageEvent(slug, eventName) {
  return `${slug}:${eventName}`;
}

// Page loads, reloads included (a counter, not a set).
export function viewsName(slug) {
  return `views:${slug}`;
}

// Visitor ids that landed on any landing page.
export const VISITORS_NAME = "visitors";

// Landing page redesigns. A redesigned page tags its visitors' events (see
// FunnelTracker), and each tagged event is also written under a
// `design:<id>:` name, so /funnel can split a page's numbers at the moment the
// redesign went live. Untagged events on that page are the earlier design.
export const DESIGNS = {
  b: { slug: "remodels", label: "Remodels redesign" },
};

export function designName(design, name) {
  return `design:${design}:${name}`;
}

// When the redesign went live: set once, by its first tagged event.
export function designSinceKey(design) {
  return funnelKey(designName(design, "since"));
}

// YYYY-MM-DD for `date` in FUNNEL_TIMEZONE.
export function funnelDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUNNEL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Shifts a YYYY-MM-DD string by whole days (calendar math only, so DST can't skew it).
export function addDays(day, days) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
