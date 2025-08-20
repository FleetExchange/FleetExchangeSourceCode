import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { GoogleMapsProvider } from "@/components/GoogleMapsProvider";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FleetExchange",
  description: "Smart Logistics Solutions",
  icons: {
    icon: "/images/logos/logo-icon.png",
    apple: "/images/logos/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="FleetExchangeLight">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <GoogleMapsProvider>
              {" "}
              <main className="flex-1">{children}</main>
              <Footer />
            </GoogleMapsProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
