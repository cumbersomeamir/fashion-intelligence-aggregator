import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import "@/styles/globals.css";
import { AppShell } from "./components/AppShell";

const headline = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const body = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fashion Intelligence Aggregator",
  description: "Multitenant aggregation, RAG concierge, personalization",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${headline.variable} ${body.variable} font-body antialiased bg-[#FCFCFC] dark:bg-[#121212] text-zinc-900 dark:text-zinc-100 min-h-screen`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
