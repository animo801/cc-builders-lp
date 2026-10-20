import { notFound } from "next/navigation";
import quotes from "../data";
import QuoteView from "../quote-view";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(quotes).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const quote = quotes[(await params).slug];
  // Quotes hold client names, addresses, and prices, so keep them out of search results.
  return { title: `Quote for ${quote.customer} | CC Builders`, robots: { index: false, follow: false } };
}

export default async function QuotePage({ params }) {
  const quote = quotes[(await params).slug];
  if (!quote) notFound();
  return <QuoteView quote={quote} />;
}
