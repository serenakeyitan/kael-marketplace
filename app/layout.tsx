import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthModalProvider } from "@/components/AuthModalProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Kael Marketplace",
  description: "Discover, use, and create AI-powered skills for Kael",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-gray-900`}
      >
        <Providers>
          <AuthProvider>
            <div className="flex h-screen">
              {/* Sidebar */}
              <div className="hidden md:block w-56 flex-shrink-0">
                <Sidebar className="h-full" />
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
            <AuthModalProvider />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
