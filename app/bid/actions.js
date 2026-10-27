"use server";

import { activeSteps, collectAnswers, otherField, projects, validateStep } from "../projects";

// The project-specific answers as "Question: answer" lines for the sheet's
// Details column. Zip, contact info, and plans have their own columns.
function leadDetails(project, answers) {
  return activeSteps(project, answers)
    .filter((step) => !["zip", "contact"].includes(step.type) && step.id !== "plans")
    .map((step) => {
      const answer = answers[step.id];
      let line = `${step.question} ${Array.isArray(answer) ? answer.join(", ") : answer}`;
      if (answers[otherField(step)]) line += ` (${answers[otherField(step)]})`;
      return line;
    })
    .join("\n");
}

// Posts the lead to the Google Apps Script web app in google-apps-script/leads.gs.
async function sendToSheet(lead) {
  const res = await fetch(process.env.LEADS_SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lead, token: process.env.LEADS_SHEET_TOKEN }),
    signal: AbortSignal.timeout(20000),
  });
  const result = await res.json().catch(() => null);
  if (!result?.ok) throw new Error(`Sheet rejected lead: ${res.status} ${result?.error ?? "no JSON response"}`);
}

export async function submitLead(slug, data) {
  const project = projects[slug];
  if (!project || typeof data !== "object" || data === null) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  for (const step of activeSteps(project, data)) {
    const error = validateStep(step, data);
    if (error) return { ok: false, error };
  }

  const answers = collectAnswers(project, data);
  const lead = {
    submittedAt: new Date().toISOString(),
    project: project.title,
    firstName: answers.firstName,
    lastName: answers.lastName,
    phone: answers.phone,
    email: answers.email,
    address: answers.address,
    zip: answers.zip,
    plans: answers.plans ?? "",
    details: leadDetails(project, { ...data, ...answers }),
  };

  // Always logged, so a lead is never lost even if the sheet is down.
  console.log("New lead", lead);

  if (!process.env.LEADS_SHEET_URL) {
    console.warn("LEADS_SHEET_URL is not set; lead was only logged.");
    return { ok: true };
  }
  try {
    await sendToSheet(lead);
  } catch (err) {
    console.error("Failed to save lead to Google Sheet", err);
    return { ok: false, error: "We couldn't send your request. Please try again in a moment." };
  }
  return { ok: true };
}
