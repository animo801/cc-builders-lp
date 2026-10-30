import {
  Bath,
  BedDouble,
  CarFront,
  CookingPot,
  Ellipsis,
  House,
  LayersArrowDown,
  Sofa,
  ArrowUpFromLine,
} from "lucide-react";

// Each project type gets a landing page at /<slug> and a bid flow at
// /bid/<slug>. Landing copy and bid questions both live here.
//
// Bid steps:
//   zip      – 5-digit zip code
//   single   – pick one option; advances as soon as one is clicked
//   multi    – pick any number of icon tiles, with an optional "other" text box
//   contact  – name, address, phone, email
// A step with `when(data)` only appears when that returns true. A single step
// with `referral(data)` sends people to /bid/<slug>/referrals instead of
// continuing.

const ZIP_STEP = { id: "zip", type: "zip", question: "What zip code is your project in?" };
const CONTACT_STEP = { id: "contact", type: "contact", question: "Great, now we just need your contact info." };

const SINGLE_BATHROOM = "1 bathroom";

const remodels = {
  slug: "remodels",
  name: "Remodel",
  title: "Remodels",
  plural: "Remodels",
  // Photos for the "we've completed" carousel, in public/images/projects/<slug>/.
  // Pages without a gallery show gray placeholders.
  gallery: [
    { src: "/images/projects/remodels/kitchen-ovens.jpg", alt: "Kitchen with stacked wall ovens and a pull-down faucet" },
    { src: "/images/projects/remodels/wet-bar.jpg", alt: "Wood-panel wet bar with smoked glass cabinets and a wine fridge" },
    { src: "/images/projects/remodels/primary-bath.jpg", alt: "Primary bathroom with a tiled soaking tub and rain shower" },
    { src: "/images/projects/remodels/kitchen-peninsula.jpg", alt: "Kitchen with a waterfall peninsula and mountain views" },
    { src: "/images/projects/remodels/guest-bath.jpg", alt: "Bathroom with marble mosaic tile, a soaking tub, and a glass shower" },
    { src: "/images/projects/remodels/open-living.jpg", alt: "Open living room and kitchen with a plywood ceiling and yellow pendant" },
  ],
  headline: "Get a detailed line item bid on your remodel",
  priceTags: [
    { label: "Paint and smooth drywall finish", price: "$15,514.11" },
    { label: "Sliding glass door", price: "$22,380.40" },
    { label: "New hardwood floors", price: "$8,216.75" },
  ],
  faqs: [
    {
      question: "What is a line item bid?",
      answer:
        "A line item bid breaks your remodel into every individual piece of work and material (demolition, framing, electrical, plumbing, fixtures, finishes, and labor), each with its own price. Instead of one lump sum, you see exactly what each part of the project costs.",
    },
    {
      question: "Why is that better than a regular quote?",
      answer:
        "A lump-sum quote makes it hard to compare contractors or adjust your budget. With a line item bid you can compare bids apples to apples, see which choices drive the cost, and decide where to save or splurge before any work starts.",
    },
    {
      question: "How do I get a bid?",
      answer:
        "Click Get your bid and answer a few quick questions about your project. We’ll set up a time to walk through your space, talk about what you want, and take measurements. Then we put together your detailed bid and go over it with you line by line.",
    },
    {
      question: "Can I change the scope after I get my bid?",
      answer:
        "Yes. Because every item is priced on its own, it’s easy to add, remove, or swap pieces of the project, like choosing a different tile or holding off on new lighting, and see exactly how the total changes.",
    },
    {
      question: "What if something unexpected comes up during construction?",
      answer:
        "Remodels sometimes uncover surprises, like water damage or outdated wiring behind a wall. If that happens, we show you what we found and price the fix as its own line item. Nothing extra gets done without your approval.",
    },
    {
      question: "What kinds of projects do you take on?",
      answer:
        "Kitchens, bathrooms, flooring, basements, and whole-home remodels. If you’re not sure whether your project is a fit, reach out and ask.",
    },
  ],
  steps: [
    ZIP_STEP,
    {
      id: "stories",
      type: "single",
      question: "How many stories is the house you’re remodeling?",
      options: ["1 story", "2 stories", "3 or more stories"],
    },
    {
      id: "scope",
      type: "multi",
      question: "What do you want to remodel?",
      options: [
        { label: "Whole house", Icon: House, exclusive: true },
        { label: "Basement", Icon: LayersArrowDown },
        { label: "Kitchen", Icon: CookingPot },
        { label: "Bathroom", Icon: Bath },
        { label: "Bedroom", Icon: BedDouble },
        { label: "Something else", Icon: Ellipsis, other: true },
      ],
    },
    {
      id: "bathrooms",
      type: "single",
      question: "How many bathrooms are you planning on remodeling?",
      options: [SINGLE_BATHROOM, "2 bathrooms", "3 or more bathrooms"],
      when: (data) => data.scope.includes("Bathroom"),
      // We don't take on single-bathroom remodels, so those go to the referrals page.
      referral: (data) => data.scope.length === 1 && data.bathrooms === SINGLE_BATHROOM,
    },
    {
      id: "plans",
      type: "single",
      question: "Do you already have construction plans?",
      options: ["Yes, I have plans", "No, not yet"],
    },
    CONTACT_STEP,
  ],
};

const additions = {
  slug: "additions",
  name: "Addition",
  title: "Home additions",
  plural: "Additions",
  headline: "Get a detailed line item bid on your addition",
  priceTags: [
    { label: "Foundation", price: "$18,940.00" },
    { label: "Framing", price: "$27,615.32" },
    { label: "Roof tie-in", price: "$9,482.10" },
  ],
  faqs: [
    {
      question: "What is a line item bid?",
      answer:
        "A line item bid breaks your addition into every individual piece of work and material (site prep, foundation, framing, roofing, electrical, plumbing, finishes, and labor), each with its own price. Instead of one lump sum, you see exactly what each part of the project costs.",
    },
    {
      question: "Why is that better than a regular quote?",
      answer:
        "A lump-sum quote makes it hard to compare contractors or adjust your budget. With a line item bid you can compare bids apples to apples, see which choices drive the cost, and decide where to save or splurge before any work starts.",
    },
    {
      question: "How do I get a bid?",
      answer:
        "Click Get your bid and answer a few quick questions about your project. We’ll set up a time to walk your property, talk about what you want, and take measurements. Then we put together your detailed bid and go over it with you line by line.",
    },
    {
      question: "Do I need plans and permits for an addition?",
      answer:
        "Almost always. If you don’t have plans yet, we can talk through the design and engineering you’ll need. Permit and plan costs show up as their own line items, so you know what they add before you commit.",
    },
    {
      question: "Can we live at home during construction?",
      answer:
        "Usually, yes. Most of the work happens outside your existing walls. When we have to open up the house to connect the addition, we plan that part around you and tell you ahead of time.",
    },
    {
      question: "What if something unexpected comes up during construction?",
      answer:
        "Tying into an existing house can uncover surprises, like an undersized beam or old wiring. If that happens, we show you what we found and price the fix as its own line item. Nothing extra gets done without your approval.",
    },
  ],
  steps: [
    ZIP_STEP,
    {
      id: "stories",
      type: "single",
      question: "How many stories is your house now?",
      options: ["1 story", "2 stories", "3 or more stories"],
    },
    {
      id: "additionType",
      type: "multi",
      question: "What are you adding?",
      options: [
        { label: "Bedroom or suite", Icon: BedDouble },
        { label: "Bigger kitchen", Icon: CookingPot },
        { label: "Living space", Icon: Sofa },
        { label: "Second story", Icon: ArrowUpFromLine },
        { label: "Garage", Icon: CarFront },
        { label: "Something else", Icon: Ellipsis, other: true },
      ],
    },
    {
      id: "size",
      type: "single",
      question: "About how big will the addition be?",
      options: ["Under 300 sq ft", "300 to 600 sq ft", "600 to 1,000 sq ft", "Over 1,000 sq ft", "Not sure yet"],
    },
    {
      id: "plans",
      type: "single",
      question: "Do you already have construction plans?",
      options: ["Yes, I have plans", "An architect is working on them", "No, not yet"],
    },
    CONTACT_STEP,
  ],
};

const newBuild = {
  slug: "new-build",
  name: "New build",
  title: "New home builds",
  plural: "New builds",
  gallery: [
    { src: "/images/projects/new-build/stone-modern-front.jpg", alt: "Two-story modern home with stone and dark siding and a glass garage door" },
    { src: "/images/projects/new-build/modern-back-hillside.jpg", alt: "Back of a new modern home with a shed roof on a hillside lot" },
    { src: "/images/projects/new-build/wood-gable-front.jpg", alt: "New home with a wood-clad gable and black stucco in the snow" },
    { src: "/images/projects/new-build/wood-gable-entry.jpg", alt: "Recessed front entry of a new home with vertical wood siding" },
  ],
  headline: "Get a detailed line item bid on your new home",
  priceTags: [
    { label: "Site work", price: "$31,205.60" },
    { label: "Framing", price: "$84,710.25" },
    { label: "Windows", price: "$26,148.90" },
  ],
  faqs: [
    {
      question: "What is a line item bid?",
      answer:
        "A line item bid breaks your new home into every individual piece of work and material (site work, foundation, framing, roofing, mechanicals, finishes, and labor), each with its own price. Instead of one lump sum, you see exactly what each part of the build costs.",
    },
    {
      question: "Why is that better than a regular quote?",
      answer:
        "A lump-sum quote makes it hard to compare builders or adjust your budget. With a line item bid you can compare bids apples to apples, see which choices drive the cost, and decide where to save or splurge before any work starts.",
    },
    {
      question: "How do I get a bid?",
      answer:
        "Click Get your bid and answer a few quick questions about your project. We’ll meet to go over your plans and your lot. Then we put together your detailed bid and go over it with you line by line.",
    },
    {
      question: "Do I need to own a lot already?",
      answer:
        "No. If you’re still looking, we can talk through what a lot will need, like grading, utilities, and access, so those costs don’t surprise you after you buy.",
    },
    {
      question: "Can I change finishes after I get my bid?",
      answer:
        "Yes. Because every item is priced on its own, it’s easy to swap flooring, fixtures, or cabinets and see exactly how the total changes.",
    },
    {
      question: "What if something unexpected comes up during construction?",
      answer:
        "Site work can turn up surprises, like rock or poor soil. If that happens, we show you what we found and price the fix as its own line item. Nothing extra gets done without your approval.",
    },
  ],
  steps: [
    ZIP_STEP,
    {
      id: "lot",
      type: "single",
      question: "Do you own the lot you’re building on?",
      options: ["Yes, I own it", "I’m in the process of buying it", "Not yet, I’m still looking"],
    },
    {
      id: "stories",
      type: "single",
      question: "How many stories are you planning?",
      options: ["1 story", "2 stories", "3 or more stories", "Not sure yet"],
    },
    {
      id: "size",
      type: "single",
      question: "About how big will the house be?",
      options: [
        "Under 2,000 sq ft",
        "2,000 to 3,000 sq ft",
        "3,000 to 4,500 sq ft",
        "Over 4,500 sq ft",
        "Not sure yet",
      ],
    },
    {
      id: "plans",
      type: "single",
      question: "Do you already have house plans?",
      options: ["Yes, I have plans", "An architect is working on them", "No, not yet"],
    },
    CONTACT_STEP,
  ],
};

const adus = {
  slug: "adus",
  name: "ADU",
  title: "ADUs",
  plural: "ADUs",
  headline: "Get a detailed line item bid on your ADU",
  priceTags: [
    { label: "Utility hookups", price: "$12,470.00" },
    { label: "Kitchenette", price: "$14,935.45" },
    { label: "Framing", price: "$21,308.80" },
  ],
  faqs: [
    {
      question: "What is a line item bid?",
      answer:
        "A line item bid breaks your ADU into every individual piece of work and material (site prep, foundation, framing, utility hookups, kitchen, bath, finishes, and labor), each with its own price. Instead of one lump sum, you see exactly what each part of the project costs.",
    },
    {
      question: "Why is that better than a regular quote?",
      answer:
        "A lump-sum quote makes it hard to compare contractors or adjust your budget. With a line item bid you can compare bids apples to apples, see which choices drive the cost, and decide where to save or splurge before any work starts.",
    },
    {
      question: "How do I get a bid?",
      answer:
        "Click Get your bid and answer a few quick questions about your project. We’ll set up a time to walk your property, talk about what you want, and take measurements. Then we put together your detailed bid and go over it with you line by line.",
    },
    {
      question: "Can I build an ADU on my property?",
      answer:
        "It depends on your city’s rules for lot size, setbacks, parking, and utilities. We’ll look at those with you during the walkthrough so you know what’s allowed before you spend money on plans.",
    },
    {
      question: "What kinds of ADUs do you build?",
      answer:
        "Detached backyard units, apartments above garages, garage conversions, basement apartments, and units attached to the house. If you’re not sure which fits your property, we can help you compare.",
    },
    {
      question: "What if something unexpected comes up during construction?",
      answer:
        "Sometimes we find surprises, like a sewer line that needs to be upgraded or an electrical panel that’s too small. If that happens, we show you what we found and price the fix as its own line item. Nothing extra gets done without your approval.",
    },
  ],
  steps: [
    ZIP_STEP,
    {
      id: "aduType",
      type: "single",
      question: "What kind of ADU are you thinking about?",
      options: [
        "Detached backyard unit",
        "Above a garage",
        "Garage conversion",
        "Basement apartment",
        "Attached to the house",
        "Not sure yet",
      ],
    },
    {
      id: "size",
      type: "single",
      question: "About how big will it be?",
      options: ["Under 500 sq ft", "500 to 800 sq ft", "800 to 1,200 sq ft", "Not sure yet"],
    },
    {
      id: "use",
      type: "single",
      question: "How will you use it?",
      options: ["Rental income", "Family or guests", "Home office or studio", "Not sure yet"],
    },
    {
      id: "plans",
      type: "single",
      question: "Do you already have construction plans?",
      options: ["Yes, I have plans", "No, not yet"],
    },
    CONTACT_STEP,
  ],
};

export const projects = { remodels, additions, "new-build": newBuild, adus };

export const CONTACT_FIELDS = ["firstName", "lastName", "address", "phone", "email"];

// Formats a US phone number as it's typed: (555) 123-4567. Drops a leading
// country code 1 so autofilled "+1 555..." numbers fit.
export function formatPhone(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("1")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function otherField(step) {
  return `${step.id}Other`;
}

export function initialAnswers(project) {
  const data = Object.fromEntries(CONTACT_FIELDS.map((f) => [f, ""]));
  for (const step of project.steps) {
    if (step.type === "zip") data.zip = "";
    if (step.type === "single") data[step.id] = "";
    if (step.type === "multi") {
      data[step.id] = [];
      if (step.options.some((o) => o.other)) data[otherField(step)] = "";
    }
  }
  return data;
}

export function activeSteps(project, data) {
  return project.steps.filter((step) => !step.when || step.when(data));
}

// Returns an error message for the step, or "" if its answers are complete.
// Used by the bid flow before moving on and again on the server.
export function validateStep(step, data) {
  if (step.type === "zip") {
    return /^\d{5}$/.test(data.zip ?? "") ? "" : "Enter a 5-digit zip code.";
  }
  if (step.type === "single") {
    return step.options.includes(data[step.id]) ? "" : "Some answers are missing. Go back and fill them in.";
  }
  if (step.type === "multi") {
    const picked = data[step.id];
    const labels = step.options.map((o) => o.label);
    if (!Array.isArray(picked) || picked.length === 0 || !picked.every((p) => labels.includes(p))) {
      return "Pick at least one.";
    }
    const other = step.options.find((o) => o.other);
    if (other && picked.includes(other.label) && !data[otherField(step)]?.trim()) {
      return "Tell us a little about what you have in mind.";
    }
    return "";
  }
  if (step.type === "contact") {
    if (CONTACT_FIELDS.some((f) => typeof data[f] !== "string" || !data[f].trim())) return "Fill in all the fields.";
    if (data.phone.replace(/\D/g, "").length < 10) return "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Enter a valid email.";
    return "";
  }
  return "";
}

// The answers that belong to the steps actually shown, so a question that was
// answered and then hidden (e.g. bathrooms after unpicking Bathroom) is dropped.
export function collectAnswers(project, data) {
  const answers = {};
  for (const step of activeSteps(project, data)) {
    if (step.type === "zip") answers.zip = data.zip;
    else if (step.type === "contact") for (const f of CONTACT_FIELDS) answers[f] = data[f].trim();
    else answers[step.id] = data[step.id];
    const other = step.type === "multi" && step.options.find((o) => o.other);
    if (other && data[step.id].includes(other.label)) answers[otherField(step)] = data[otherField(step)].trim();
  }
  return answers;
}
