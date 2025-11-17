import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REYKO-FM",
  description: "Unreleased REYKO! radio.",
  icons: {
    icon: [
      { url: "/favicon-desktop.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon-desktop.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-desktop.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-desktop.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon-apple.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "REYKO-FM",
    description: "Unreleased REYKO! radio.",
    url: "https://reyko-fm.vercel.app",
    siteName: "REYKO-FM",
    type: "website",
    images: [
      {
        url: "/favicon-apple.png",
        width: 180,
        height: 180,
        alt: "REYKO-FM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "REYKO-FM",
    description: "Unreleased REYKO! radio.",
    images: ["/favicon-apple.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
