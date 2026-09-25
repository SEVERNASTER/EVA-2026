import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EVA 2026",
  description:
    "Plataforma de formación continua con certificación digital verificable",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/*
          THESIS: Sign-in as a dark operating console, not a marketing hero or split-brand splash.
          OWN-WORLD: Vercel dashboard grammar — #000 ground, hairline zinc borders, white primary, Geist.
          STORY: Identify yourself, land in the panel your role owns, never cross into another role.
          FIRST VIEWPORT: Centered 380px panel on a slow grid; title, fields, white Continuar; demo accounts folded.
          FORM: Canon — Vercel dashboard. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        {children}
      </body>
    </html>
  );
}
