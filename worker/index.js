import { EmailMessage } from "cloudflare:email";

const DEDUPE_SECONDS = 24 * 60 * 60;

// Static files are served by the assets binding before this code runs, so only
// paths with no matching file reach here. That is just /api/* in practice.
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/resume-download") {
      if (request.method !== "POST") return text("Method not allowed", 405);
      return notifyResumeDownload(request, env, ctx);
    }

    return text("Not found", 404);
  },
};

async function notifyResumeDownload(request, env, ctx) {
  // Only accept pings from the site itself. Browsers send Origin on POST.
  const allowed = (env.SITE_HOSTS || "").split(",").map((h) => h.trim()).filter(Boolean);
  const origin = request.headers.get("Origin");
  if (origin) {
    let host = "";
    try { host = new URL(origin).hostname; } catch (_) { /* ignore */ }
    if (!allowed.includes(host)) return text("Forbidden", 403);
  }

  // Per-visitor cap so a script cannot flood the inbox.
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (env.RL) {
    const { success } = await env.RL.limit({ key: ip });
    if (!success) return text("Too many requests", 429);
  }

  // One email per visitor per day, so repeated clicks (or a bot replaying the
  // request) never bomb the inbox. Keyed on IP plus browser so two colleagues
  // behind one office NAT still each get through. Uses the edge cache, which
  // needs no binding; it is per data centre, so a visitor who hops between
  // Cloudflare locations could at worst trigger a second email.
  const ua = request.headers.get("User-Agent") || "unknown browser";
  const seenKey = new Request("https://manasbolt.com/__notified/" + await sha256(ip + "|" + ua));
  const cache = caches.default;
  if (await cache.match(seenKey)) return text("Already notified", 200);
  await cache.put(seenKey, new Response("1", {
    headers: { "Cache-Control": "public, max-age=" + DEDUPE_SECONDS },
  }));

  let payload = {};
  try { payload = await request.json(); } catch (_) { /* beacon may be empty */ }

  const cf = request.cf || {};
  const when = new Date();
  const place = [cf.city, cf.region, cf.country].filter(Boolean).join(", ") || "unknown location";
  const referrer = clean(payload.referrer) || "direct / none";
  const page = clean(payload.page) || "/";
  const where = clean(payload.location) || "unknown";

  const body = [
    "Someone just downloaded your resume from manasbolt.com.",
    "",
    `When:      ${when.toUTCString()}`,
    `Where:     ${place}${cf.timezone ? ` (${cf.timezone})` : ""}`,
    `Clicked:   the ${where} link`,
    `Page:      ${page}`,
    `Referrer:  ${referrer}`,
    `Browser:   ${ua}`,
    "",
    "Sent automatically by the portfolio Worker.",
  ].join("\n");

  const subject = `Resume downloaded from manasbolt.com (${place})`;
  const raw = [
    `From: Portfolio <${env.NOTIFY_FROM}>`,
    `To: ${env.NOTIFY_TO}`,
    `Subject: ${subject}`,
    `Date: ${when.toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@manasbolt.com>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");

  try {
    await env.NOTIFY.send(new EmailMessage(env.NOTIFY_FROM, env.NOTIFY_TO, raw));
  } catch (err) {
    console.error("notify email failed:", err && err.message ? err.message : err);
    // Let the next click retry instead of silently losing the day's one email.
    ctx.waitUntil(cache.delete(seenKey));
    // The download already happened in the browser; never surface this to the visitor.
    return text("Accepted", 202);
  }
  return text("OK", 200);
}

async function sha256(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clean(v) {
  if (typeof v !== "string") return "";
  return v.replace(/[\r\n]/g, " ").slice(0, 300);
}

function text(message, status) {
  return new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
