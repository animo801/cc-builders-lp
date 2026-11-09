import { Redis } from "@upstash/redis";
import { ALLOWED_EVENTS } from "../../funnel/stages";
import { funnelDay, funnelKey, pageEvent, viewsName, VISITORS_NAME } from "../../funnel/store";

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

  const { sessionId, visitorId, slug, eventName } = body ?? {};
  if (!isId(sessionId) || typeof eventName !== "string" || !ALLOWED_EVENTS[slug]?.has(eventName)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  try {
    const day = funnelDay();
    const name = pageEvent(slug, eventName);
    const pipeline = Redis.fromEnv()
      .pipeline()
      .sadd(funnelKey(name), sessionId)
      .sadd(funnelKey(name, day), sessionId);
    if (eventName === "landed") {
      const visitor = isId(visitorId) ? visitorId : sessionId;
      pipeline
        .incr(funnelKey(viewsName(slug)))
        .incr(funnelKey(viewsName(slug), day))
        .sadd(funnelKey(VISITORS_NAME), visitor)
        .sadd(funnelKey(VISITORS_NAME, day), visitor);
    }
    await pipeline.exec();
  } catch (err) {
    console.error("funnel-event write error:", err);
  }

  return Response.json({ ok: true });
}
