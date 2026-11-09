// Best-effort step-by-step funnel logging. Events go to this site's own
// /api/funnel-event route, which counts them in Redis for the chart at
// /funnel. Event names have to be in app/funnel/stages.js or they're dropped.
//
// Add ?test=1 to any page to try the flow without counting toward /funnel; it
// stays on for that tab until it closes or a page is opened with ?test=0.

const SESSION_KEY = "cc_funnel_session_id";
const VISITOR_KEY = "cc_funnel_visitor_id";
const TEST_KEY = "cc_test_mode";

function isTestMode() {
  try {
    const param = new URLSearchParams(window.location.search).get("test");
    if (param === "1") sessionStorage.setItem(TEST_KEY, "1");
    if (param === "0") sessionStorage.removeItem(TEST_KEY);
    return sessionStorage.getItem(TEST_KEY) === "1";
  } catch {
    return false;
  }
}

// crypto.randomUUID throws on older iPhones (including Facebook and
// Instagram's in-app browsers there), so fall back to a random string.
function randomId() {
  try {
    if (crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

function getId(storage, key) {
  let id = storage.getItem(key);
  if (!id) {
    id = randomId();
    storage.setItem(key, id);
  }
  return id;
}

export function logFunnelEvent(slug, eventName) {
  if (isTestMode()) return;
  try {
    // The session id (one per tab) drives the step counts. The visitor id
    // outlives the tab, so a returning visitor counts once in "unique visitors".
    const sessionId = getId(sessionStorage, SESSION_KEY);
    let visitorId = sessionId;
    try {
      visitorId = getId(localStorage, VISITOR_KEY);
    } catch {}

    const payload = JSON.stringify({ sessionId, visitorId, slug, eventName });
    // sendBeacon survives the page navigating away right after a click.
    if (!navigator.sendBeacon?.("/api/funnel-event", new Blob([payload], { type: "application/json" }))) {
      fetch("/api/funnel-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // analytics only — never block the visitor over this
  }
}
