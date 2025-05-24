

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthInitializer from "./(components)/_AuthInitializer/page";
import StoreProvider from "./StoreProvider";
import { Suspense } from "react";
// import { usePathname } from 'next/navigation';

import ClientNavbarWrapper from "./(components)/_clientNavbarWrapper/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GotsApp",
  description: "Chat with you buddies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><StoreProvider>
        <AuthInitializer/>
        <Suspense>
        <ClientNavbarWrapper/>
        {children}
        </Suspense>
        
        </StoreProvider>
      </body>
    </html>
  );
}