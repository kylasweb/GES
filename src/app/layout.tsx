import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DebugBar } from "@/components/debug/debug-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Green Energy Solutions",
  description: "Your trusted partner for solar energy solutions. Quality solar panels, batteries, and renewable energy products.",
  keywords: ["solar panels", "solar energy", "renewable energy", "solar batteries", "green energy"],
  authors: [{ name: "Green Energy Solutions Team" }],
  openGraph: {
    title: "Green Energy Solutions",
    description: "Leading provider of solar panels, batteries, and renewable energy solutions",
    url: "https://ges.com",
    siteName: "Green Energy Solutions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Energy Solutions",
    description: "Leading provider of solar panels, batteries, and renewable energy solutions",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <DebugBar />
      </body>
    </html>
  );
}
