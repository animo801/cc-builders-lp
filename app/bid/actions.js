"use server";

import { activeSteps, collectAnswers, projects, validateStep } from "../projects";

export async function submitLead(slug, data) {
  const project = projects[slug];
  if (!project || typeof data !== "object" || data === null) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  for (const step of activeSteps(project, data)) {
    const error = validateStep(step, data);
    if (error) return { ok: false, error };
  }

  // TODO: deliver the lead (email, CRM, or database). Until that's wired up,
  // submissions only appear in the server logs.
  console.log("New lead", { type: slug, ...collectAnswers(project, data), submittedAt: new Date().toISOString() });

  return { ok: true };
}
