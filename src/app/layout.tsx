import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./(main)/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "VTT Superapp",
    description: "Vehicle Tracker & Integrated Apps",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
