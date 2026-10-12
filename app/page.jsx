import Image from "next/image";
import heroImage from "../public/images/hero.jpg";
import ctaImage from "../public/images/cta.jpg";
import Button from "./components/button";
import Logo from "./components/logo";

// SAMPLE REVIEWS: placeholder copy to show the layout. Replace with real
// Google reviews (and the reviewer's name as shown on Google) before launch.
const reviews = [
  {
    name: "Customer name",
    project: "Kitchen remodel",
    text: "We got three bids for our kitchen and CC Builders was the only one that showed us exactly where the money was going. Every cabinet, outlet, and hour of labor was on there. When we needed to trim the budget, we could see what to cut instead of guessing.",
  },
  {
    name: "Customer name",
    project: "Bathroom remodel",
    text: "The line item bid made it easy to compare. We swapped the tile we had picked for something less expensive and saw the savings right away. The crew was clean, showed up on time, and kept us updated every day.",
  },
  {
    name: "Customer name",
    project: "Basement finish",
    text: "No surprise change orders at the end. When something came up behind a wall, they walked us through it and priced it out before doing anything. That kind of honesty is rare.",
  },
  {
    name: "Customer name",
    project: "New floors",
    text: "New floors through the whole main level. The bid broke out removal, prep, materials, and install room by room, so we knew exactly what we were paying for. Great communication from start to finish.",
  },
];

const faqs = [
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
];

// Infinite horizontal scroller. Renders the items twice and slides the track
// by half its width so the loop is seamless. `copyClassName` must include a
// trailing padding equal to the gap, e.g. "gap-4 pr-4".
function Marquee({ children, copyClassName, duration = "40s", className = "" }) {
  return (
    <div
      className={`flex w-max animate-marquee motion-reduce:animate-none ${className}`}
      style={{ "--marquee-duration": duration }}
    >
      <div className={`flex shrink-0 items-center ${copyClassName}`}>{children}</div>
      <div aria-hidden className={`flex shrink-0 items-center ${copyClassName}`}>
        {children}
      </div>
    </div>
  );
}

// Floating line-item price tag pinned to the hero photo. `side` controls which
// way the connector line points.
function PriceTag({ label, price, side, className }) {
  const right = side === "right";
  return (
    <div className={`absolute hidden lg:block ${className}`}>
      <img
        src={right ? "/images/connector-right.svg" : "/images/connector-left.svg"}
        alt=""
        width={113.659}
        height={22.4915}
        className={`absolute ${right ? "left-[202px] top-[64px]" : "left-[-98px] top-[65px] -scale-x-100"}`}
      />
      <div className="relative h-[76px] w-[202px] rounded-[8px] border-2 border-brand bg-brand-tint px-[14px] pt-[14px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.2)]">
        <p className="text-[16px] font-bold leading-[20px] text-black opacity-50">{label}</p>
        <p className="mt-[4px] text-[24px] font-bold leading-[20px] text-black">{price}</p>
      </div>
    </div>
  );
}

function TrustedBar() {
  return (
    <div className="absolute bottom-[21px] left-1/2 flex h-[79px] w-[897px] max-w-[calc(100%-32px)] -translate-x-1/2 items-center overflow-hidden rounded-[8px] bg-white pl-[40.5px] pr-[5.5px]">
      <p className="w-[159px] shrink-0 font-serif text-[24px] font-bold leading-[64px] text-black opacity-40">
        Trusted by
      </p>
      <div className="relative flex h-full flex-1 items-center overflow-hidden">
        <Marquee copyClassName="gap-[56px] pr-[56px]" duration="40s">
          {Array.from({ length: 6 }, (_, i) => (
            <img key={i} src="/images/avatar-placeholder.svg" alt="" width={64} height={64} className="shrink-0" />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[184px] bg-gradient-to-r from-white to-white/0" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[184px] bg-gradient-to-l from-white to-white/0" />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative h-[960px] overflow-hidden text-white">
      <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 to-ink/0" />

      <div className="absolute left-1/2 top-[24px] -translate-x-1/2">
        <Logo />
      </div>

      <div className="relative mx-auto flex max-w-[757px] flex-col items-center px-4 pt-[200px] text-center">
        <h1 className="font-serif text-[44px] font-bold leading-[1] md:text-[64px]">
          Get a detailed line item bid on your remodel
        </h1>
        <p className="mt-[12px] font-serif text-[22px] leading-[40px] md:text-[28px]">
          This is the thing we do. And it is glorious.
        </p>
        <div className="mt-[24px]">
          <Button />
        </div>
      </div>

      <PriceTag label="New floors" price="$15,514.11" side="right" className="left-[70.21%] top-[525px]" />
      <PriceTag label="New floors" price="$15,514.11" side="left" className="left-[15.28%] top-[595px]" />
      <PriceTag label="New floors" price="$15,514.11" side="right" className="left-[61.18%] top-[750px]" />

      <TrustedBar />
    </section>
  );
}

function Intro() {
  return (
    <section className="mx-auto grid max-w-[1248px] gap-12 px-4 py-24 lg:grid-cols-[648px_560px] lg:justify-between lg:gap-0">
      <div className="lg:pt-[47px]">
        <h2 className="font-serif text-[36px] font-bold leading-[1] md:text-[48px]">
          Get a detailed line item bid on your remodel
        </h2>
        <div className="mt-4 space-y-10 font-serif text-[20px] leading-[40px] md:text-[24px]">
          <p>
            So this is a test... we are going to type basically whatever we want into here to see what this thing
            can do. And then we will change it and make it look better.
          </p>
          <p>
            So just to be careful, lets also see what it takes to make it look like a second paragraph up in
            hizzle. Boom.
          </p>
        </div>
        <div className="mt-8">
          <Button />
        </div>
      </div>
      <div className="aspect-[560/582] w-full bg-placeholder" />
    </section>
  );
}

function Projects() {
  return (
    <section className="overflow-hidden bg-brand/5 py-24">
      <h2 className="px-4 text-center font-serif text-[36px] font-bold leading-[48px] text-black md:text-[48px]">
        Projects we’ve completed
      </h2>
      <Marquee className="mt-10 hover:[animation-play-state:paused]" copyClassName="gap-4 pr-4" duration="120s">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="aspect-[548/531] w-[min(548px,80vw)] shrink-0 bg-placeholder" />
        ))}
      </Marquee>
    </section>
  );
}

function ReviewCard({ name, project, text }) {
  return (
    <figure className="flex min-h-[540px] w-[471px] max-w-[85vw] shrink-0 snap-start flex-col bg-brand/5 p-10">
      <p className="text-[24px] tracking-[4px] text-brand" aria-label="5 out of 5 stars">
        ★★★★★
      </p>
      <blockquote className="mt-6 flex-1 font-serif text-[22px] leading-[34px] text-ink">“{text}”</blockquote>
      <figcaption className="mt-8 border-t border-brand/20 pt-6">
        <p className="text-[18px] font-bold text-ink">{name}</p>
        <p className="mt-1 text-[16px] text-ink/60">{project} · Google review</p>
      </figcaption>
    </figure>
  );
}

function Reviews() {
  return (
    <section className="py-24">
      <h2 className="mx-auto max-w-[1232px] px-4 font-serif text-[36px] font-bold leading-[48px] text-black md:text-[48px]">
        Read some of our Google Reviews
      </h2>
      <div className="mt-8 flex snap-x gap-4 overflow-x-auto px-[max(1rem,calc((100%-1200px)/2))] scroll-px-[max(1rem,calc((100%-1200px)/2))] [scrollbar-width:none]">
        {reviews.map((review, i) => (
          <ReviewCard key={i} {...review} />
        ))}
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="bg-brand/5 px-4 pb-[120px] pt-[157px]">
      <h2 className="text-center font-serif text-[40px] font-bold leading-[48px] text-black md:text-[56px]">
        Frequently Asked Questions
      </h2>
      <div className="mx-auto mt-[63px] max-w-[829px] space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="group border border-black bg-white">
            <summary className="flex min-h-[96px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4">
              <span className="font-serif text-[20px] font-bold leading-[1.3] text-black md:text-[22px]">
                {faq.question}
              </span>
              <img
                src="/images/chevron-down.svg"
                alt=""
                width={36}
                height={36}
                className="shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="-mt-2 px-6 pb-8 font-serif text-[18px] leading-[30px] text-ink/80">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="relative h-[642px] overflow-hidden text-white">
      <Image src={ctaImage} alt="" fill sizes="100vw" className="object-cover object-[50%_56%]" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 to-ink/0" />
      <div className="relative mx-auto flex max-w-[757px] flex-col items-center px-4 pt-[201px] text-center">
        <h2 className="font-serif text-[44px] font-bold leading-[1] md:text-[64px]">
          Get a detailed line item bid on your remodel
        </h2>
        <div className="mt-8">
          <Button />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Intro />
      <Projects />
      <Reviews />
      <Faq />
      <ClosingCta />
      <footer className="h-[630px] bg-ink" />
    </main>
  );
}
