import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Runceipt",
  description: "Turn your Strava runs into shareable receipts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
