import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compare.Live — Real-time Prices",
  description: "Search globally. Buy locally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
