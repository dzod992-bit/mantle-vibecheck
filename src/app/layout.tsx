import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mantle VibeCheck | Ship contracts with proof",
  description:
    "AI-assisted security review and on-chain audit proofs for vibe-coded Solidity contracts on Mantle.",
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
