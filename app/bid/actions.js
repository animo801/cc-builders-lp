"use server";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
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

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

// Meta events sent for every successful bid submission: the standard Lead
// event, plus a custom one that's easy to find in Events Manager. Keep in sync
// with the fbq calls in bid-flow.jsx.
const META_LEAD_EVENTS = ["Lead", "BidRequestSubmitted"];

// Sends the submission events to Meta's Conversions API. The browser pixel
// fires the same events with the same eventId, so Meta counts each once. Never
// throws, so a tracking problem can't fail a lead.
async function sendLeadToMeta(eventId, project, answers) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !accessToken) return;

  const cookieStore = await cookies();
  const headersList = await headers();
  const fbp = cookieStore.get("_fbp")?.value;
  const fbc = cookieStore.get("_fbc")?.value;
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = headersList.get("user-agent");
  const phone = answers.phone?.replace(/\D/g, "");

  const base = {
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    ...(headersList.get("referer") && { event_source_url: headersList.get("referer") }),
    custom_data: { content_name: project.title },
    user_data: {
      ...(answers.email && { em: [sha256(answers.email.trim().toLowerCase())] }),
      ...(phone && { ph: [sha256(phone.length === 10 ? `1${phone}` : phone)] }),
      ...(answers.firstName && { fn: [sha256(answers.firstName.trim().toLowerCase())] }),
      ...(answers.lastName && { ln: [sha256(answers.lastName.trim().toLowerCase())] }),
      ...(answers.zip && { zp: [sha256(answers.zip.trim())] }),
      ...(fbc && { fbc }),
      ...(fbp && { fbp }),
      ...(ip && { client_ip_address: ip }),
      ...(userAgent && { client_user_agent: userAgent }),
    },
  };
  const events = META_LEAD_EVENTS.map((event_name) => ({ event_name, ...base }));

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: events,
        // Routes events to Events Manager's Test Events tab instead of live data.
        ...(process.env.META_TEST_EVENT_CODE && { test_event_code: process.env.META_TEST_EVENT_CODE }),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) console.error(`Meta CAPI events failed: ${res.status} ${await res.text()}`);
  } catch (err) {
    console.error("Meta CAPI events errored", err);
  }
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
  } else {
    try {
      await sendToSheet(lead);
    } catch (err) {
      console.error("Failed to save lead to Google Sheet", err);
      return { ok: false, error: "We couldn't send your request. Please try again in a moment." };
    }
  }

  const eventId = randomUUID();
  await sendLeadToMeta(eventId, project, answers);
  return { ok: true, eventId };
}
