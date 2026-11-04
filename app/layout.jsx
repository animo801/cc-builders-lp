import { Baskervville } from "next/font/google";
import Script from "next/script";
import { ATTRIBUTION_COOKIE, ATTRIBUTION_KEYS } from "./attribution";
import "./globals.css";

const baskervville = Baskervville({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-baskervville",
});

export const metadata = { title: "CC Builders" };

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={baskervville.variable}>
      <body>
        {/* Remembers the ad's UTM tags (and fbclid) from whichever page a visitor
            lands on, so submitLead in app/bid/actions.js can attach them to the
            lead. Last touch wins: a new tagged visit replaces the old tags. */}
        <Script
          id="utm-capture"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              var p = new URLSearchParams(location.search), keys = ${JSON.stringify(ATTRIBUTION_KEYS)}, a = {}, any = false;
              keys.forEach(function(k){ var v = p.get(k); if (v) { a[k] = v.slice(0, 200); any = true; } });
              if (any) document.cookie = "${ATTRIBUTION_COOKIE}=" + encodeURIComponent(JSON.stringify(a)) + "; path=/; max-age=2592000; samesite=lax";
            })();
          `,
          }}
        />
        {pixelId && (
          <>
            <Script
              id="fb-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init','${pixelId}');
                fbq('track','PageView');
              `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
