import { Redis } from "@upstash/redis";
import { connection } from "next/server";
import { FunnelChart } from "./funnel-chart";
import { FUNNEL_PROJECTS } from "./stages";
import { addDays, FUNNEL_TIMEZONE, funnelDay, funnelKey, pageEvent, viewsName, VISITORS_NAME } from "./store";

// Bid funnel for every landing page: unique sessions at each step, from the
// landing page through the bid flow. Password protected by proxy.js
// (FUNNEL_PASSWORD) and kept out of search engines.

export const metadata = { title: "Funnel | CC Builders", robots: { index: false, follow: false } };

// Date filter presets, keyed by the `range` search param. `from`/`to` are
// days back from today (0 = today); null = all time.
const PRESETS = [
  { key: "today", label: "Today", from: 0, to: 0 },
  { key: "yesterday", label: "Yesterday", from: 1, to: 1 },
  { key: "7d", label: "Last 7 days", from: 6, to: 0 },
  { key: "30d", label: "Last 30 days", from: 29, to: 0 },
  { key: "all", label: "All time", from: null, to: null },
];

// Longest custom range: each day is one more Redis key per event to union.
const MAX_RANGE_DAYS = 366;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Custom from/to dates win over a preset; anything missing or malformed falls
// back to all time. `range` is null for all time.
function resolveRange(params) {
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";

  if (DAY_PATTERN.test(from) || DAY_PATTERN.test(to)) {
    let start = DAY_PATTERN.test(from) ? from : to;
    let end = DAY_PATTERN.test(to) ? to : from;
    if (start > end) [start, end] = [end, start];
    if (addDays(start, MAX_RANGE_DAYS - 1) < end) start = addDays(end, -(MAX_RANGE_DAYS - 1));
    return { range: { from: start, to: end }, activeKey: "custom" };
  }

  const preset = PRESETS.find((p) => p.key === params.range) ?? PRESETS.find((p) => p.key === "all");
  const today = funnelDay();
  return {
    range: preset.from === null ? null : { from: addDays(today, -preset.from), to: addDays(today, -preset.to) },
    activeKey: preset.key,
  };
}

function daysBetween(from, to) {
  const days = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
}

// Unique-session counts for every event on every page, plus the headline
// page views and unique visitors, in one Redis round trip.
async function loadMetrics(range) {
  const events = FUNNEL_PROJECTS.flatMap((p) =>
    p.stages.flatMap((s) => s.nodes.map((n) => pageEvent(p.slug, n.event))),
  );
  const setNames = [...events, VISITORS_NAME];
  const viewNames = FUNNEL_PROJECTS.map((p) => viewsName(p.slug));
  const pipeline = Redis.fromEnv().pipeline();

  if (!range) {
    setNames.forEach((n) => pipeline.scard(funnelKey(n)));
    pipeline.mget(...viewNames.map((n) => funnelKey(n)));
  } else {
    // Union each set's daily keys into a throwaway key (SUNIONSTORE returns
    // the union's size) so someone seen on several days counts once.
    const days = daysBetween(range.from, range.to);
    const tmpPrefix = `cc:funnel:tmp:${crypto.randomUUID()}`;
    setNames.forEach((n) => {
      const tmp = `${tmpPrefix}:${n}`;
      pipeline.sunionstore(tmp, ...days.map((d) => funnelKey(n, d)));
      pipeline.del(tmp);
    });
    pipeline.mget(...viewNames.flatMap((n) => days.map((d) => funnelKey(n, d))));
  }

  const results = await pipeline.exec();
  const stride = range ? 2 : 1;
  const sizes = setNames.map((_, i) => Number(results[i * stride] ?? 0));
  const viewCounts = results[results.length - 1] ?? [];

  return {
    counts: Object.fromEntries(events.map((e, i) => [e, sizes[i]])),
    visitors: sizes[sizes.length - 1],
    views: viewCounts.reduce((sum, v) => sum + Number(v ?? 0), 0),
  };
}

function formatDay(day) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Builds a /funnel link, keeping only the params that are set.
function funnelHref(params) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return query ? `/funnel?${query}` : "/funnel";
}

function Stat({ label, value, note }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5">
      <p className="text-sm font-bold text-black/60">{label}</p>
      <p className="mt-2 text-4xl font-semibold leading-none tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-black/40">{note}</p>
    </div>
  );
}

export default async function FunnelPage({ searchParams }) {
  await connection();
  const params = await searchParams;
  const { range, activeKey } = resolveRange(params);
  const project = FUNNEL_PROJECTS.find((p) => p.slug === params.project) ?? FUNNEL_PROJECTS[0];
  // Keep the selected tab when the date range changes, and vice versa.
  const projectParam = project === FUNNEL_PROJECTS[0] ? undefined : project.slug;
  const rangeParams =
    activeKey === "custom" ? { from: range.from, to: range.to } : { range: activeKey === "all" ? undefined : activeKey };

  let metrics = { counts: {}, views: 0, visitors: 0 };
  let error = null;
  try {
    metrics = await loadMetrics(range);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const { counts, views, visitors } = metrics;
  const leads = FUNNEL_PROJECTS.reduce((sum, p) => sum + (counts[pageEvent(p.slug, "submitted")] ?? 0), 0);
  // The chart works on bare event names, so pick out this page's counts.
  const projectCounts = Object.fromEntries(
    project.stages.flatMap((s) => s.nodes.map((n) => [n.event, counts[pageEvent(project.slug, n.event)] ?? 0])),
  );
  const rangeLabel = !range
    ? "all time"
    : range.from === range.to
      ? formatDay(range.from)
      : `${formatDay(range.from)} – ${formatDay(range.to)}`;

  return (
    <main className="min-h-screen bg-white pb-16 font-sans text-black">
      <div className="bg-black/[0.04] px-4 pb-10 pt-8 md:px-10">
        <h1 className="text-[28px] font-bold leading-[1.15]">CC Builders Funnel</h1>
        <p className="mt-1 text-sm text-black/50">Showing {rangeLabel}. Funnel steps count unique sessions.</p>

        <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
          <nav aria-label="Date range" className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <a
                key={p.key}
                href={funnelHref({ range: p.key === "all" ? undefined : p.key, project: projectParam })}
                aria-current={activeKey === p.key ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-bold no-underline ${
                  activeKey === p.key ? "bg-black text-white" : "bg-white text-black/70 hover:bg-black/10"
                }`}
              >
                {p.label}
              </a>
            ))}
          </nav>

          <form action="/funnel" className="flex flex-wrap items-end gap-2">
            {projectParam && <input type="hidden" name="project" value={projectParam} />}
            {["from", "to"].map((name) => (
              <label key={name} className="text-xs font-bold capitalize text-black/50">
                {name}
                <input
                  type="date"
                  name={name}
                  defaultValue={range?.[name]}
                  max={funnelDay()}
                  required
                  className="mt-1 block h-9 rounded border border-black/10 bg-white px-2 text-sm text-black"
                />
              </label>
            ))}
            <button
              type="submit"
              className={`h-9 rounded px-4 text-sm font-bold ${
                activeKey === "custom" ? "bg-black text-white" : "bg-white text-black/70 hover:bg-black/10"
              }`}
            >
              Apply
            </button>
          </form>
        </div>

        <section aria-label="Summary" className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Page views" value={views.toLocaleString()} note="All pages, reloads included" />
          <Stat label="Unique visitors" value={visitors.toLocaleString()} note="Counted once across the range" />
          <Stat label="Leads" value={leads.toLocaleString()} note="Submitted contact info, all pages" />
          <Stat
            label="Conversion rate"
            value={visitors > 0 ? `${((leads / visitors) * 100).toFixed(1)}%` : "—"}
            note="Leads ÷ unique visitors"
          />
        </section>
      </div>

      <div className="px-4 md:px-10">
        {error && <p className="mt-6 text-sm text-red-600">Couldn’t load funnel data: {error}</p>}

        <nav aria-label="Landing page" className="mt-10 flex gap-6 overflow-x-auto border-b border-black/10">
          {FUNNEL_PROJECTS.map((p) => {
            const active = p === project;
            const landed = counts[pageEvent(p.slug, "landed")] ?? 0;
            return (
              <a
                key={p.slug}
                href={funnelHref({ ...rangeParams, project: p === FUNNEL_PROJECTS[0] ? undefined : p.slug })}
                aria-current={active ? "page" : undefined}
                className={`-mb-px shrink-0 border-b-2 pb-3 no-underline ${
                  active ? "border-black text-black" : "border-transparent text-black/50 hover:text-black/80"
                }`}
              >
                <span className="block text-base font-bold">/{p.slug}</span>
                <span className="block text-xs">
                  {p.label} · {landed.toLocaleString()} sessions
                </span>
              </a>
            );
          })}
        </nav>

        <div className="mt-6">
          <FunnelChart stages={project.stages} counts={projectCounts} />
        </div>

        <p className="mt-10 text-xs text-black/40">
          Days run midnight to midnight, {FUNNEL_TIMEZONE} time. Add ?test=1 to any page to click through without
          counting here.
        </p>
      </div>
    </main>
  );
}
