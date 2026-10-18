import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "CinePrimeSeries - TV Series Discovery, Worldwide Guides & Official Trailers",
  description:
    "Explore worldwide TV series metadata, episode guides, cast credits, official YouTube trailers, and Telegram community links on CinePrimeSeries. Strictly TV series only.",
  keywords: [
    "TV Series",
    "TV Shows",
    "Episode Guide",
    "Series Trailers",
    "Tamil Web Series",
    "Tamil Dubbed Series",
    "CinePrimeSeries",
    "CinePrime",
  ],
  authors: [{ name: "CinePrimeSeries" }],
  openGraph: {
    title: "CinePrimeSeries - TV Series Discovery & Worldwide Episode Guides",
    description: "Explore worldwide TV series, official trailers, seasons, and episodes.",
    url: "https://cineprimeseries.vercel.app",
    siteName: "CinePrimeSeries",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CinePrimeSeries - TV Series Discovery",
    description: "Discover the best worldwide TV series, official trailers, and episode guides.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-100 antialiased selection:bg-primary/30 selection:text-white flex flex-col">
        <ToastProvider>
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
