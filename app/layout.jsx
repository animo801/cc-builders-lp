import { Baskervville } from "next/font/google";
import "./globals.css";

const baskervville = Baskervville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-baskervville",
});

export const metadata = { title: "CC Builders" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={baskervville.variable}>
      <body>{children}</body>
    </html>
  );
}
