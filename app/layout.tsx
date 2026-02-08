import type { Metadata } from "next";
import { Merriweather, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghana International School Admin",
  description: "Donor App Admin Dashboard",
  icons: {
    icon: "/favicon/favicon.webp",
    apple: "/favicon/favicon-192.webp",
    shortcut: "/favicon/favicon-152.webp",
  },
};

import SessionProvider from "@/providers/SessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import ToastProvider from "@/providers/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.variable} ${sourceSans.variable} antialiased font-sans`}
      >
        <SessionProvider>
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
