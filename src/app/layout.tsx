import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vehicle Expense Tracker",
  description: "Track your vehicle expenses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="container max-w-7xl py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
