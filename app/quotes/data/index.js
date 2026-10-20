import sample from "./sample";

// Every quote page. Add each new quote file here; its `slug` becomes the URL
// (/quotes/<slug>).
const quotes = [sample];

export default Object.fromEntries(quotes.map((quote) => [quote.slug, quote]));
