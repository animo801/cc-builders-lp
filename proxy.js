import { NextResponse } from "next/server";

// Password-protects /funnel with the browser's built-in login prompt (HTTP
// Basic auth). Any username works; the password is FUNNEL_PASSWORD. With no
// password set, the page stays locked rather than open.

function unauthorized() {
  return new NextResponse("Password required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="CC Builders funnel", charset="UTF-8"' },
  });
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function proxy(request) {
  const password = process.env.FUNNEL_PASSWORD;
  const header = request.headers.get("authorization") ?? "";
  if (!password || !header.startsWith("Basic ")) return unauthorized();

  let supplied = "";
  try {
    const decoded = atob(header.slice(6));
    supplied = decoded.slice(decoded.indexOf(":") + 1);
  } catch {
    return unauthorized();
  }
  return safeEqual(supplied, password) ? NextResponse.next() : unauthorized();
}

export const config = { matcher: ["/funnel", "/funnel/:path*"] };
