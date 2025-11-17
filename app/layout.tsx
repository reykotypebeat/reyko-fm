import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REYKO-FM",
  description: "Unreleased REYKO! radio.",
  icons: {
    icon: [
      { url: "/desktop ouroboros green favicon 512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/desktop ouroboros green favicon 512x512.png", sizes: "192x192", type: "image/png" },
      { url: "/desktop ouroboros green favicon 512x512.png", sizes: "32x32", type: "image/png" },
      { url: "/desktop ouroboros green favicon 512x512.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/iphone ouroboros green favicon 512x512.png", sizes: "180x180", type: "image/png" },
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
        url: "/desktop ouroboros green favicon 512x512.png",
        width: 512,
        height: 512,
        alt: "REYKO-FM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "REYKO-FM",
    description: "Unreleased REYKO! radio.",
    images: ["/desktop ouroboros green favicon 512x512.png"],
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
