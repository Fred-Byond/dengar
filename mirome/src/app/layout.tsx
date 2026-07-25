import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIROME Team Intelligence",
  description:
    "AI-powered team diagnosis, workshop customisation and organisational development. Digital-human assessment plus a team intelligence dashboard. By BYOND Asia.",
  applicationName: "MIROME Team Intelligence",
  authors: [{ name: "BYOND Asia" }],
};

export const viewport: Viewport = {
  themeColor: "#22306E",
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
