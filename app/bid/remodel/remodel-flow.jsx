"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bath, BedDouble, CookingPot, Ellipsis, House, LayersArrowDown } from "lucide-react";
import { submitRemodelLead } from "./actions";

const STORY_OPTIONS = ["1 story", "2 stories", "3 or more stories"];
const SCOPE_OPTIONS = [
  { label: "Whole house", Icon: House },
  { label: "Basement", Icon: LayersArrowDown },
  { label: "Kitchen", Icon: CookingPot },
  { label: "Bathroom", Icon: Bath },
  { label: "Bedroom", Icon: BedDouble },
  { label: "Something else", Icon: Ellipsis },
];
const BATHROOM_OPTIONS = ["1 bathroom", "2 bathrooms", "3 or more bathrooms"];
const PLAN_OPTIONS = ["Yes, I have plans", "No, not yet"];
const STORAGE_KEY = "cc-remodel-bid";

const initialData = {
  zip: "",
  stories: "",
  scope: [],
  scopeOther: "",
  bathrooms: "",
  plans: "",
  firstName: "",
  lastName: "",
  address: "",
  phone: "",
  email: "",
};

// Answers are kept in sessionStorage so a refresh, or coming back from the
// referrals page, doesn't wipe the form.
function loadSaved() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

// The bathroom count question only appears when Bathroom is picked.
function stepsFor(scope) {
  return ["zip", "stories", "scope", ...(scope.includes("Bathroom") ? ["bathrooms"] : []), "plans", "contact"];
}

// We don't take on single-bathroom remodels, so those go to the referrals page.
function isSingleBathroomOnly(scope, bathrooms) {
  return scope.length === 1 && scope[0] === "Bathroom" && bathrooms === BATHROOM_OPTIONS[0];
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

function ScopeTile({ label, Icon, selected, onClick }) {
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
      <span className="text-[16px] font-bold">{label}</span>
      <input
        required
        {...props}
        className="mt-2 h-14 w-full border border-ink/30 bg-white px-4 text-[18px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
    </label>
  );
}

export default function RemodelFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saved] = useState(loadSaved);
  const [data, setData] = useState({ ...initialData, ...saved.data });
  // The furthest step reached, so a pasted ?step=5 can't skip questions.
  const [furthest, setFurthest] = useState(saved.furthest ?? 0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const requested = Math.max(0, (Number(searchParams.get("step")) || 1) - 1);
  const steps = stepsFor(data.scope);
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
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, furthest }));
    } catch {}
  }, [data, furthest, done]);

  function update(fields) {
    setData((d) => ({ ...d, ...fields }));
    setError("");
  }

  function goTo(nextStep) {
    setFurthest((f) => Math.max(f, nextStep));
    window.history.pushState(null, "", stepUrl(nextStep));
  }

  // Single-choice questions advance as soon as an option is picked.
  function choose(field, value) {
    update({ [field]: value });
    goTo(step + 1);
  }

  function chooseBathrooms(value) {
    update({ bathrooms: value });
    if (isSingleBathroomOnly(data.scope, value)) return router.push("/bid/remodel/referrals");
    goTo(step + 1);
  }

  // "Whole house" covers everything, so it can't be combined with other rooms.
  // Changing rooms can add or remove the bathroom question, so later steps
  // have to be answered again rather than reached with the forward button.
  function toggleScope(option) {
    setError("");
    setFurthest((f) => Math.min(f, step));
    setData((d) => {
      let scope;
      if (d.scope.includes(option)) scope = d.scope.filter((s) => s !== option);
      else if (option === "Whole house") scope = [option];
      else scope = [...d.scope.filter((s) => s !== "Whole house"), option];
      return { ...d, scope, bathrooms: scope.includes("Bathroom") ? d.bathrooms : "" };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (current === "zip") {
      if (!/^\d{5}$/.test(data.zip)) return setError("Enter a 5-digit zip code.");
      return goTo(step + 1);
    }

    if (current === "scope") {
      if (data.scope.length === 0) return setError("Pick at least one.");
      if (data.scope.includes("Something else") && !data.scopeOther.trim()) {
        return setError("Tell us a little about what you want to remodel.");
      }
      return goTo(step + 1);
    }

    if (current === "contact") {
      if (data.phone.replace(/\D/g, "").length < 10) return setError("Enter a valid phone number.");
      setSubmitting(true);
      try {
        const result = await submitRemodelLead(data);
        if (result.ok) {
          setDone(true);
          try {
            sessionStorage.removeItem(STORAGE_KEY);
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
  }

  if (done) {
    return (
      <div className="text-center">
        <Question>Thanks, {data.firstName}!</Question>
        <p className="mt-6 font-serif text-[20px] leading-[32px] text-ink/80">
          We got your project details. We’ll reach out soon to set up a time to walk through your space.
        </p>
      </div>
    );
  }

  const showContinue = current === "zip" || current === "scope" || current === "contact";

  return (
    <form onSubmit={handleSubmit} noValidate={current !== "contact"}>
      {current === "zip" && (
        <>
          <Question>What zip code is your project in?</Question>
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
        </>
      )}

      {current === "stories" && (
        <>
          <Question>How many stories is the house you’re remodeling?</Question>
          <div className="mt-8 space-y-3">
            {STORY_OPTIONS.map((option) => (
              <Option key={option} selected={data.stories === option} onClick={() => choose("stories", option)}>
                {option}
              </Option>
            ))}
          </div>
        </>
      )}

      {current === "scope" && (
        <>
          <Question>What do you want to remodel?</Question>
          <p className="mt-3 text-[16px] text-ink/60">Pick all that apply.</p>
          <div className="mt-8 grid grid-cols-2 gap-3" role="group" aria-label="What do you want to remodel?">
            {SCOPE_OPTIONS.map(({ label, Icon }) => (
              <ScopeTile
                key={label}
                label={label}
                Icon={Icon}
                selected={data.scope.includes(label)}
                onClick={() => toggleScope(label)}
              />
            ))}
          </div>
          {data.scope.includes("Something else") && (
            <label className="mt-6 block">
              <span className="text-[16px] font-bold">Tell us what you have in mind</span>
              <textarea
                rows={4}
                value={data.scopeOther}
                onChange={(e) => update({ scopeOther: e.target.value })}
                className="mt-2 w-full border border-ink/30 bg-white p-4 text-[18px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            </label>
          )}
        </>
      )}

      {current === "bathrooms" && (
        <>
          <Question>How many bathrooms are you planning on remodeling?</Question>
          <div className="mt-8 space-y-3">
            {BATHROOM_OPTIONS.map((option) => (
              <Option key={option} selected={data.bathrooms === option} onClick={() => chooseBathrooms(option)}>
                {option}
              </Option>
            ))}
          </div>
        </>
      )}

      {current === "plans" && (
        <>
          <Question>Do you already have construction plans?</Question>
          <div className="mt-8 space-y-3">
            {PLAN_OPTIONS.map((option) => (
              <Option key={option} selected={data.plans === option} onClick={() => choose("plans", option)}>
                {option}
              </Option>
            ))}
          </div>
        </>
      )}

      {current === "contact" && (
        <>
          <Question>Where should we send your bid?</Question>
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
        </>
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
        {showContinue && (
          <button type="submit" disabled={submitting} className="ml-auto inline-flex h-[64px] items-center justify-center bg-brand px-10 text-[17px] font-bold md:text-[20px] text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {current === "contact" ? (submitting ? "Sending…" : "Get your bid") : "Continue"}
          </button>
        )}
      </div>
    </form>
  );
}
