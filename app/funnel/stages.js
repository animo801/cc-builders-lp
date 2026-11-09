import { projects } from "../projects";

// Funnel stages for each project type, built straight from the bid steps in
// projects.js so the chart can't drift from the questions people actually see.
// Event names match what app/funnel.js logs:
//   landed            – viewed the /<slug> landing page
//   bid_click         – clicked a "Get your bid" button
//   zip               – entered a zip code
//   <stepId>=<answer> – picked an answer (multi-select logs one per pick)
//   referred          – sent to the referrals page (didn't qualify)
//   submitted         – submitted contact info (the lead)

// Short column headings; anything missing falls back to the step's question.
const STEP_TITLES = {
  stories: "Stories",
  scope: "What to remodel",
  bathrooms: "Bathrooms",
  plans: "Has plans?",
  additionType: "What they’re adding",
  size: "Size",
  lot: "Owns the lot?",
  aduType: "ADU type",
  use: "Use",
};

function stagesFor(project) {
  const stages = [
    { title: "Landed", nodes: [{ event: "landed", label: "Landed on page" }] },
    { title: "Clicked CTA", nodes: [{ event: "bid_click", label: "Clicked “Get your bid”" }] },
  ];

  for (const step of project.steps) {
    if (step.type === "zip") {
      stages.push({ title: "Zip code", nodes: [{ event: "zip", label: "Entered zip" }] });
    } else if (step.type === "single" || step.type === "multi") {
      const nodes = step.options.map((o) => {
        const label = typeof o === "string" ? o : o.label;
        return { event: `${step.id}=${label}`, label };
      });
      if (step.referral) nodes.push({ event: "referred", label: "Sent to referrals", terminal: true });
      stages.push({ title: STEP_TITLES[step.id] ?? step.question, nodes });
    }
  }

  stages.push({ title: "Converted", nodes: [{ event: "submitted", label: "Submitted contact info" }] });
  return stages;
}

export const FUNNEL_PROJECTS = Object.values(projects).map((p) => ({
  slug: p.slug,
  label: p.plural,
  stages: stagesFor(p),
}));

// Every event name each landing page may log. /api/funnel-event drops anything
// else, so a typo (or someone poking the endpoint) can't create junk keys.
export const ALLOWED_EVENTS = Object.fromEntries(
  FUNNEL_PROJECTS.map((p) => [p.slug, new Set(p.stages.flatMap((s) => s.nodes.map((n) => n.event)))]),
);
