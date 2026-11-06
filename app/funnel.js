// Best-effort step-by-step funnel logging. Events go to the funnel_events
// table behind robmetcalfdesign.com's /api/funnel-event, which feeds the
// funnel chart at /admin/leads/analytics/cc-builders on that site. Event
// names have to match rmd-website/app/admin/leads/analytics/cc-builders/stages.ts.
//
// The www host matters: the bare domain redirects, and beacons don't survive that well.
const ENDPOINT = process.env.NEXT_PUBLIC_FUNNEL_ENDPOINT ?? "https://www.robmetcalfdesign.com/api/funnel-event";
const SESSION_KEY = "cc_funnel_session_id";

// One id per browser tab, shared by the landing page and the bid flow.
function sessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function logFunnelEvent(slug, eventName, props) {
  try {
    const payload = JSON.stringify({
      sessionId: sessionId(),
      page: `cc-builders-${slug}`,
      eventName,
      props: props ?? null,
    });
    // text/plain keeps this a "simple" cross-origin request, so the browser
    // sends it without a CORS preflight. The endpoint parses the body as JSON anyway.
    const body = new Blob([payload], { type: "text/plain" });
    if (!navigator.sendBeacon?.(ENDPOINT, body)) {
      fetch(ENDPOINT, { method: "POST", mode: "no-cors", body, keepalive: true }).catch(() => {});
    }
  } catch {
    // analytics only — never block the visitor over this
  }
}
