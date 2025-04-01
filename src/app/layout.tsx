import { Providers } from "./providers";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "CRM Platform",
  description: "One stop solution for your business",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "CRM Platform",
    description: "One stop solution for your business",
    url: "https://example.com",
    siteName: "CRM Platform",
    images: [
      {
        url: "https://example.com/og-image.png",
        width: 800,
        height: 600,
        alt: "CRM Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRM Platform",
    description: "One stop solution for your business",
    images: ["https://example.com/og-image.png"],
    site: "@example",
    creator: "@example",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    noarchive: false,
    noimageindex: false,
    notranslate: false,
  },
  verification: {
    google: "google-site-verification=example",
    yandex: "yandex-verification: example",
    other: {
      name: "example",
      url: "https://example.com",
      type: "html",
      value: "example",
    },
  },
  alternates: {
    canonical: "https://example.com",
    languages: {
      "en-US": "/en",
      "fr-FR": "/fr",
    },
  },
  // manifest: "/manifest.json",
};

const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
