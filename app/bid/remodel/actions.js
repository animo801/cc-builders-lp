"use server";

const REQUIRED = ["zip", "stories", "plans", "firstName", "lastName", "address", "phone", "email"];

export async function submitRemodelLead(data) {
  for (const field of REQUIRED) {
    if (typeof data?.[field] !== "string" || !data[field].trim()) {
      return { ok: false, error: "Some answers are missing. Go back and fill them in." };
    }
  }
  if (!/^\d{5}$/.test(data.zip)) return { ok: false, error: "Enter a 5-digit zip code." };
  if (!Array.isArray(data.scope) || data.scope.length === 0) {
    return { ok: false, error: "Pick what you want to remodel." };
  }
  if (data.scope.includes("Bathroom") && !data.bathrooms) {
    return { ok: false, error: "Tell us how many bathrooms you're remodeling." };
  }
  if (data.phone.replace(/\D/g, "").length < 10) return { ok: false, error: "Enter a valid phone number." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { ok: false, error: "Enter a valid email." };

  // TODO: deliver the lead (email, CRM, or database). Until that's wired up,
  // submissions only appear in the server logs.
  console.log("New remodel lead", { ...data, type: "remodel", submittedAt: new Date().toISOString() });

  return { ok: true };
}
