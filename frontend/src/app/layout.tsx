import type { Metadata } from "next";
import localFont from 'next/font/local'
import "../libs/globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import * as dotenv from 'dotenv'

const avallonFont = localFont({
  src: '../libs/fonts/avallon.ttf',
  variable: '--font-title',
})

const quicksandFont = localFont({
  src: '../libs/fonts/Quicksand-VariableFont_wght.ttf',
  variable: '--font-text'
})

export const metadata: Metadata = {
  title: "Sac’Azura - Sacs faits main et personnalisables en Normandie",
  description: "Sacs et accessoires faits main en Normandie, personnalisables et en petites séries. Idée cadeau originale et artisanale, créée par Gigi dans son atelier normand.",
  keywords: ["sac'azura", "upcycling", "sacs", "accessoires", "normandie", "artisanal"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html
      lang="fr"
      className={`${avallonFont.variable} ${quicksandFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}