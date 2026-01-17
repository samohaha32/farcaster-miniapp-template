import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const DOMAIN = "https://farcaster-miniapp-template-blond.vercel.app";

export const metadata: Metadata = {
  title: "Flip Flop",
  description: "Onchain coin flip on Base",
  metadataBase: new URL(DOMAIN),
  openGraph: {
    title: "Flip Flop",
    description: "Onchain coin flip on Base",
    url: DOMAIN,
    siteName: "Flip Flop",
    images: [
      {
        url: "/og-flipflop.png",
        width: 1200,
        height: 630,
        alt: "Flip Flop",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flip Flop",
    description: "Onchain coin flip on Base",
    images: ["/og-flipflop.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
