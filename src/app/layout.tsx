import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DENGAR.ai — Talk to the Minister",
  description:
    "A scheduled digital-human citizen-listening platform and national sentiment intelligence dashboard for the Ministry of Home Affairs, Malaysia. By BYOND Asia.",
  applicationName: "DENGAR.ai",
  authors: [{ name: "BYOND Asia" }],
};

export const viewport: Viewport = {
  themeColor: "#1B2A6B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
