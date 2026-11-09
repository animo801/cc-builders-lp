import { ChevronRight } from "lucide-react";

function percent(part, whole) {
  return whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : "—";
}

function stageCount(stage, counts, { skipTerminal = false } = {}) {
  return stage.nodes
    .filter((n) => !(skipTerminal && n.terminal))
    .reduce((sum, n) => sum + (counts[n.event] ?? 0), 0);
}

function NodeBox({ node, count, landedCount, prevCount }) {
  return (
    <div
      className={`w-[168px] rounded-xl border px-4 py-3 text-center ${
        node.terminal ? "border-red-200 bg-red-50" : "border-black/10 bg-white"
      }`}
    >
      <div className="text-xs font-semibold leading-4 text-black/50">{node.label}</div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums text-black">{count.toLocaleString()}</div>
      {prevCount !== null && (
        <div className="text-xs font-semibold text-black/60">{percent(count, prevCount)} of previous step</div>
      )}
      <div className="text-xs text-black/40">{percent(count, landedCount)} of landed</div>
    </div>
  );
}

// Horizontal branching funnel: one column per stage, one box per event in
// that stage. Each box shows its share of the previous step and of everyone
// who landed.
export function FunnelChart({ stages, counts }) {
  const landedCount = counts[stages[0].nodes[0].event] ?? 0;
  if (landedCount === 0) return <p className="text-sm text-black/50">No visits in this date range yet.</p>;

  return (
    <div className="flex items-start gap-3 overflow-x-auto pb-4">
      {stages.map((stage, i) => {
        const stageTotal = stageCount(stage, counts);
        // People who left at the previous step (e.g. sent to referrals) can't
        // continue, so they don't count against this step's conversion.
        const prevCount = i > 0 ? stageCount(stages[i - 1], counts, { skipTerminal: true }) : null;
        return (
          <div key={stage.title} className="flex shrink-0 items-start gap-3">
            {i > 0 && <ChevronRight aria-hidden="true" className="mt-16 size-5 shrink-0 text-black/20" />}
            <div className="flex w-[168px] shrink-0 flex-col items-center gap-2">
              <div className="text-center text-xs font-bold uppercase tracking-wide text-black/40">
                {stage.title}
                {stage.nodes.length > 1 && (
                  <span className="block font-semibold normal-case tracking-normal">
                    {stageTotal.toLocaleString()} total
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {stage.nodes.map((node) => (
                  <NodeBox
                    key={node.event}
                    node={node}
                    count={counts[node.event] ?? 0}
                    landedCount={landedCount}
                    prevCount={prevCount}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
