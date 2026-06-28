import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoAudit - Community Waste Logger",
  description:
    "Log disposed waste with automatically validated geolocation to prevent fraudulent entries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
