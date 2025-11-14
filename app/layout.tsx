import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REYKO-FM",
  description: "Unreleased REYKO! radio.",
  openGraph: {
    title: "REYKO-FM",
    description: "Unreleased REYKO! radio.",
    url: "https://reyko-fm.vercel.app",
    siteName: "REYKO-FM",
    type: "website",
    images: [
      {
        url: "/reyko-fm-og.png",
        width: 1600,
        height: 900,
        alt: "REYKO-FM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "REYKO-FM",
    description: "Unreleased REYKO! radio.",
    images: ["/reyko-fm-og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">{children}</body>
    </html>
  );
}
