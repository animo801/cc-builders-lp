import { Redis } from "@upstash/redis";
import { ALLOWED_EVENTS } from "../../funnel/stages";
import {
  designName,
  designSinceKey,
  DESIGNS,
  funnelDay,
  funnelKey,
  pageEvent,
  viewsName,
  VISITORS_NAME,
} from "../../funnel/store";

// Records one funnel event from app/funnel.js. See app/funnel/store.js for
// how the counts are laid out in Redis.

function isId(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 64;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const { sessionId, visitorId, slug, eventName, design } = body ?? {};
  if (!isId(sessionId) || typeof eventName !== "string" || !ALLOWED_EVENTS[slug]?.has(eventName)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  // Only honor a design tag for the page that design belongs to.
  const tag = DESIGNS[design]?.slug === slug ? design : null;

  try {
    const day = funnelDay();
    const pipeline = Redis.fromEnv().pipeline();
    // Every event goes in the page's sets; tagged ones also in the design's.
    const names = (name) => (tag ? [name, designName(tag, name)] : [name]);

    for (const name of names(pageEvent(slug, eventName))) {
      pipeline.sadd(funnelKey(name), sessionId).sadd(funnelKey(name, day), sessionId);
    }
    if (eventName === "landed") {
      const visitor = isId(visitorId) ? visitorId : sessionId;
      for (const name of names(viewsName(slug))) {
        pipeline.incr(funnelKey(name)).incr(funnelKey(name, day));
      }
      for (const name of names(VISITORS_NAME)) {
        pipeline.sadd(funnelKey(name), visitor).sadd(funnelKey(name, day), visitor);
      }
    }
    if (tag) pipeline.set(designSinceKey(tag), new Date().toISOString(), { nx: true });
    await pipeline.exec();
  } catch (err) {
    console.error("funnel-event write error:", err);
  }

  return Response.json({ ok: true });
}
