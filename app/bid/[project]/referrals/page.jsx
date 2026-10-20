import Link from "next/link";
import BidShell from "../../bid-shell";

// Only remodels has a referral path (single-bathroom remodels).
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ project: "remodels" }];
}

export const metadata = { title: "Bathroom remodel recommendations | CC Builders" };

// PLACEHOLDER: replace with the contractors you actually refer people to.
const referrals = [
  { name: "Referral name", specialty: "Bathroom remodels", phone: "(555) 555-0100", website: "" },
  { name: "Referral name", specialty: "Tile and showers", phone: "(555) 555-0101", website: "" },
  { name: "Referral name", specialty: "Small remodels and repairs", phone: "(555) 555-0102", website: "" },
];

export default function ReferralsPage() {
  return (
    <BidShell>
      <h1 className="font-serif text-[32px] font-bold leading-[0.95] md:text-[36px]">
        We don’t take on single-bathroom remodels
      </h1>
      <p className="mt-6 font-serif text-[20px] leading-[32px] text-ink/80">
        But we know people who do great work. Here are a few we’d recommend.
      </p>

      <ul className="mt-10 space-y-3">
        {referrals.map((r, i) => (
          <li key={i} className="border-2 border-ink/15 bg-white px-6 py-5">
            <p className="text-[20px] font-bold">{r.name}</p>
            <p className="mt-1 text-[16px] text-ink/60">{r.specialty}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[16px] font-bold text-brand">
              <a href={`tel:${r.phone.replace(/\D/g, "")}`}>{r.phone}</a>
              {r.website && (
                <a href={r.website} target="_blank" rel="noreferrer">
                  Visit website
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-[16px] text-ink/60">
        Remodeling more than one bathroom?{" "}
        <Link href="/bid/remodels" className="font-bold text-brand underline">
          Start your bid again
        </Link>
      </p>
    </BidShell>
  );
}
