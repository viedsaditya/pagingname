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
  title: "JAS Paging Management",
  description: "Airport paging management dashboard",
  icons: {
    icon: "/logojasaja.png",
    shortcut: "/logojasaja.png",
    apple: "/logojasaja.png",
  },
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
        suppressHydrationWarning={true}
      >
        <div className="air-theme min-h-screen">
          <div className="air-layer air-layer-0 bg-air-gradient"></div>
          <div className="air-layer air-layer-1 bg-airport-photo"></div>
          <div className="air-layer air-layer-2 bg-slate-900/70"></div>
          <div className="air-layer air-layer-3 bg-air-overlay"></div>
          <div className="air-layer air-layer-3 bg-air-scanlines animate-scanlines"></div>
          <div className="air-layer air-layer-3 bg-air-clouds"></div>

          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
