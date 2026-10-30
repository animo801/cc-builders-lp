"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { activeSteps, initialAnswers, otherField, projects, validateStep } from "../projects";
import { submitLead } from "./actions";

// Answers are kept in sessionStorage so a refresh, or coming back from the
// referrals page, doesn't wipe the form.
function loadSaved(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key)) ?? {};
  } catch {
    return {};
  }
}

// Each step gets its own URL (?step=2 and so on) so the browser's back and
// forward buttons move between questions.
function stepUrl(step) {
  return step === 0 ? window.location.pathname : `?step=${step + 1}`;
}

function Question({ children }) {
  return <h1 className="font-serif text-[32px] font-bold leading-[0.95] md:text-[36px]">{children}</h1>;
}

function Option({ selected, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-full items-center border-2 px-6 py-5 text-left text-[20px] font-bold transition-colors ${
        selected ? "border-brand bg-brand-tint" : "border-ink/15 bg-white hover:border-brand/60"
      }`}
    >
      {children}
    </button>
  );
}

function Tile({ label, Icon, selected, onClick }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={`relative flex flex-col items-start gap-3 border-2 p-4 text-left text-[16px] font-bold transition-colors ${
        selected ? "border-brand bg-brand-tint" : "border-ink/15 bg-white hover:border-brand/60"
      }`}
    >
      <Icon aria-hidden size={28} strokeWidth={1.5} className={selected ? "text-brand" : "text-ink/70"} />
      {label}
      <span
        aria-hidden
        className={`absolute right-3 top-3 flex size-5 items-center justify-center border-2 text-[12px] text-white ${
          selected ? "border-brand bg-brand" : "border-ink/30"
        }`}
      >
        {selected && "✓"}
      </span>
    </button>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[16px] font-bold leading-[20px]">{label}</span>
      <input
        required
        {...props}
        className="mt-1 h-14 w-full border border-ink/20 bg-white px-4 text-[18px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
    </label>
  );
}

export default function BidFlow({ slug }) {
  const project = projects[slug];
  const storageKey = `cc-bid-${slug}`;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saved] = useState(() => loadSaved(storageKey));
  const [data, setData] = useState(() => ({ ...initialAnswers(project), ...saved.data }));
  // The furthest step reached, so a pasted ?step=5 can't skip questions.
  const [furthest, setFurthest] = useState(saved.furthest ?? 0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const requested = Math.max(0, (Number(searchParams.get("step")) || 1) - 1);
  const steps = activeSteps(project, data);
  const step = Math.min(requested, furthest, steps.length - 1);
  const current = steps[step];

  useEffect(() => {
    if (requested > furthest) window.history.replaceState(null, "", stepUrl(furthest));
    // Only on first load; afterwards goTo keeps the URL and `furthest` in sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setError("");
    window.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    if (done) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ data, furthest }));
    } catch {}
  }, [data, furthest, done, storageKey]);

  function update(fields) {
    setData((d) => ({ ...d, ...fields }));
    setError("");
  }

  function goTo(nextStep) {
    setFurthest((f) => Math.max(f, nextStep));
    window.history.pushState(null, "", stepUrl(nextStep));
  }

  // Single-choice questions advance as soon as an option is picked.
  function choose(value) {
    const next = { ...data, [current.id]: value };
    update({ [current.id]: value });
    if (current.referral?.(next)) return router.push(`/bid/${slug}/referrals`);
    goTo(step + 1);
  }

  // An `exclusive` option (like "Whole house") can't be combined with others.
  // Changing picks can add or remove later questions, so later steps have to
  // be answered again rather than reached with the forward button.
  function toggle(option) {
    setError("");
    setFurthest((f) => Math.min(f, step));
    setData((d) => {
      const picked = d[current.id];
      const exclusive = current.options.filter((o) => o.exclusive).map((o) => o.label);
      let next;
      if (picked.includes(option.label)) next = picked.filter((p) => p !== option.label);
      else if (option.exclusive) next = [option.label];
      else next = [...picked.filter((p) => !exclusive.includes(p)), option.label];
      return { ...d, [current.id]: next };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const stepError = validateStep(current, data);
    if (stepError) return setError(stepError);
    if (current.type !== "contact") return goTo(step + 1);

    setSubmitting(true);
    try {
      const result = await submitLead(slug, data);
      if (result.ok) {
        window.fbq?.("track", "Lead", { content_name: project.title }, { eventID: result.eventId });
        setDone(true);
        try {
          sessionStorage.removeItem(storageKey);
        } catch {}
        window.history.replaceState(null, "", window.location.pathname);
        window.scrollTo({ top: 0 });
      } else {
        setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <Question>Thanks, {data.firstName}!</Question>
        <p className="mt-6 font-serif text-[20px] leading-[32px] text-ink/80">
          We got your project details. We’ll reach out soon to set up a time to talk through your project.
        </p>
      </div>
    );
  }

  const otherOption = current.type === "multi" && current.options.find((o) => o.other);

  return (
    <form onSubmit={handleSubmit} noValidate={current.type !== "contact"}>
      <Question>{current.question}</Question>

      {current.type === "zip" && (
        <Field
          label="Zip code"
          className="mt-8"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          autoFocus
          value={data.zip}
          onChange={(e) => update({ zip: e.target.value.replace(/\D/g, "") })}
        />
      )}

      {current.type === "single" && (
        <div className="mt-8 space-y-3">
          {current.options.map((option) => (
            <Option key={option} selected={data[current.id] === option} onClick={() => choose(option)}>
              {option}
            </Option>
          ))}
        </div>
      )}

      {current.type === "multi" && (
        <>
          <p className="mt-3 text-[16px] text-ink/60">Pick all that apply.</p>
          <div className="mt-8 grid grid-cols-2 gap-3" role="group" aria-label={current.question}>
            {current.options.map((option) => (
              <Tile
                key={option.label}
                label={option.label}
                Icon={option.Icon}
                selected={data[current.id].includes(option.label)}
                onClick={() => toggle(option)}
              />
            ))}
          </div>
          {otherOption && data[current.id].includes(otherOption.label) && (
            <label className="mt-6 block">
              <span className="text-[16px] font-bold">Tell us what you have in mind</span>
              <textarea
                rows={4}
                value={data[otherField(current)]}
                onChange={(e) => update({ [otherField(current)]: e.target.value })}
                className="mt-2 w-full border border-ink/20 bg-white p-4 text-[18px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            </label>
          )}
        </>
      )}

      {current.type === "contact" && (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Field
            label="First name"
            autoComplete="given-name"
            value={data.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
          />
          <Field
            label="Last name"
            autoComplete="family-name"
            value={data.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
          />
          <Field
            label="Address"
            className="md:col-span-2"
            autoComplete="street-address"
            value={data.address}
            onChange={(e) => update({ address: e.target.value })}
          />
          <Field
            label="Phone"
            type="tel"
            autoComplete="tel"
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-[16px] font-bold text-red-700">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        {step > 0 && (
          <button type="button" onClick={() => window.history.back()} className="text-[18px] font-bold text-ink/60 hover:text-ink">
            ← Back
          </button>
        )}
        {current.type !== "single" && (
          <button type="submit" disabled={submitting} className="ml-auto inline-flex h-[64px] items-center justify-center bg-brand px-10 text-[17px] font-bold md:text-[20px] text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {current.type === "contact" ? (submitting ? "Sending…" : "Get your bid") : "Continue"}
          </button>
        )}
      </div>
    </form>
  );
}
