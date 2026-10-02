import "./globals.css";

export const metadata = { title: "CC Builders" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
