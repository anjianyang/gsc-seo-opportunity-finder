import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GSC SEO Opportunity Finder",
  description:
    "Upload Google Search Console exports and find practical SEO opportunities locally in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
