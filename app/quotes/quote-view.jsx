"use client";

import { useState } from "react";
import Image from "next/image";
import { DM_Sans } from "next/font/google";
import Logo from "../components/logo";

const dmSans = DM_Sans({ subsets: ["latin"], axes: ["opsz"] });

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[12px] font-bold text-ink/40">{label}</p>
      <p className="text-[14px] font-bold leading-[16px]">{value}</p>
    </div>
  );
}

function Stat({ label, children, className = "" }) {
  return (
    <div className={className}>
      <p className="text-[12px] font-bold text-white/50">{label}</p>
      {children}
    </div>
  );
}

// The selected tab is taller than the others and runs into the panel below,
// with a faint line where they meet, so it reads as one shape.
function OptionTabs({ options, selected, onSelect }) {
  return (
    <div role="tablist" aria-label="Quote options" className="grid grid-cols-2 items-start gap-2">
      {options.map((option, i) => {
        const active = i === selected;
        return (
          <button
            key={option.name}
            type="button"
            role="tab"
            id={`quote-tab-${i}`}
            aria-selected={active}
            aria-controls="quote-panel"
            onClick={() => onSelect(i)}
            className={`relative text-[16px] font-black transition-colors ${
              active
                ? "h-[57px] rounded-t-[6px] bg-brand pb-1 text-white"
                : "h-[53px] rounded-[6px] bg-[#f7f7f7] text-ink hover:bg-[#ececec]"
            }`}
          >
            {option.name}
            {active && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-white/20" />}
          </button>
        );
      })}
    </div>
  );
}

export default function QuoteView({ quote }) {
  const [selected, setSelected] = useState(0);
  const option = quote.options[selected];
  const hasTabs = quote.options.length > 1;
  // Square off the panel corner under the selected tab so they join.
  const panelCorner = !hasTabs ? "" : selected === 0 ? "rounded-tl-none" : selected === quote.options.length - 1 ? "rounded-tr-none" : "";

  return (
    <div className={`${dmSans.className} min-h-screen bg-white leading-[normal] text-ink [font-variation-settings:'opsz'_14]`}>
      <div className="mx-auto max-w-[720px] px-3 pb-16 pt-4">
        <div className="ml-[5px] h-[38px] w-[41px]">
          <div className="origin-top-left scale-[0.4726]">
            <Logo dark />
          </div>
        </div>

        <section className="mt-[11px] grid grid-cols-[minmax(0,191fr)_minmax(0,187fr)] overflow-hidden rounded-[6px] bg-[#f7f7f7]">
          <div className="relative aspect-square">
            <Image
              src={quote.photo}
              alt={`${quote.address}`}
              fill
              priority
              sizes="(min-width: 720px) 360px, 50vw"
              className="object-cover"
              style={{ objectPosition: quote.photoPosition ?? "50% 50%" }}
            />
          </div>
          <div className="space-y-4 px-3 pb-3 pt-4">
            <Detail label="Customer" value={quote.customer} />
            <Detail label="Address" value={quote.address} />
            <Detail label="Project Type" value={quote.projectType} />
          </div>
        </section>

        <section className="mt-2">
          {hasTabs && <OptionTabs options={quote.options} selected={selected} onSelect={setSelected} />}
          <div
            id="quote-panel"
            role={hasTabs ? "tabpanel" : undefined}
            aria-labelledby={hasTabs ? `quote-tab-${selected}` : undefined}
            className={`rounded-[6px] bg-brand px-4 pb-6 pt-4 text-white ${panelCorner}`}
          >
            <div className="grid grid-cols-[170fr_176fr] gap-x-2">
              <Stat label="Total Estimate">
                <p className="text-[24px] font-black">{currency.format(option.total)}</p>
              </Stat>
              <Stat label="Timeline">
                <p className="text-[24px] font-black">{option.timeline}</p>
              </Stat>
            </div>
            {option.description && (
              <Stat label="Description" className="mt-3">
                <p className="text-[16px] [font-variation-settings:'opsz'_9]">{option.description}</p>
              </Stat>
            )}
          </div>
        </section>

        <section className="mt-8 px-3">
          <h2 className="text-[18px] font-medium leading-[16px] text-black">Itemized Quote</h2>
          <div aria-hidden className="mt-[6px] h-1 w-[98px] bg-brand/30" />
          <ul className="mt-4">
            {option.items.map((item, i) => (
              <li key={i} className="border-b border-[#d9d9d9]/30 py-4 first:pt-0">
                <div className="flex items-baseline justify-between gap-4 text-black">
                  <p className="text-[20px] leading-[16px]">{item.name}</p>
                  <p className="shrink-0 text-[18px] leading-[16px] opacity-50">{currency.format(item.price)}</p>
                </div>
                {item.description && (
                  <p className="mt-[7px] text-[16px] leading-[24px] text-black/60">{item.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
