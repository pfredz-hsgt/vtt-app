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
  title: "Luncheon Order - Lunch Coordination Made Easy",
  description: "Coordinate daily lunch orders with your team effortlessly",
};

import Sidebar from "@/components/dolce/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <Sidebar />
        <main style={{ marginLeft: '0', minHeight: '100vh', transition: 'all 0.3s' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
