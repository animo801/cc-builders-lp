// Ad attribution captured from the landing URL by the utm-capture script in
// layout.jsx and read back in app/bid/actions.js when a lead is submitted.
export const ATTRIBUTION_COOKIE = "cc_attribution";
export const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];

// Parses the cookie value into { utm_source, ... } with only known keys.
export function parseAttribution(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Object.fromEntries(
      ATTRIBUTION_KEYS.filter((k) => typeof parsed[k] === "string" && parsed[k]).map((k) => [k, parsed[k].slice(0, 200)]),
    );
  } catch {
    return {};
  }
}
