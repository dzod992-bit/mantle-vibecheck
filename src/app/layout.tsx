import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mantle-vibecheck.vercel.app"),
  title: "Mantle VibeCheck | Solidity security proofs on Mantle",
  description:
    "AI-assisted security review and on-chain audit proofs for vibe-coded Solidity contracts on Mantle.",
  openGraph: {
    title: "Mantle VibeCheck",
    description:
      "Scan Solidity, generate a threat model, and publish a verifiable audit proof on Mantle.",
    type: "website",
    url: "/",
  },
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
