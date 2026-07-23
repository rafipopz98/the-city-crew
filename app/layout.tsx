import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProviders";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { SITE_CONFIG } from "@/lib/site";
import { UtmCapture } from "@/components/common/UtmCapture";
import { VisitorTracker } from "@/components/common/VisitorTracker";
import { PageTracker } from "@/components/common/PageTracker";
import { ServiceWorkerRegister } from "@/components/common/ServiceWorkerRegister";
import { PwaInstallPrompt } from "@/components/common/PwaInstallPrompt";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06182e",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),

  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },

  description: SITE_CONFIG.description,

  applicationName: SITE_CONFIG.name,

  manifest: "/manifest.json",

  keywords: [...SITE_CONFIG.keywords],

  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    creator: SITE_CONFIG.twitter,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },

  robots: {
    index: true,
    follow: true,
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_CONFIG.shortName,
  },

  icons: {
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <UtmCapture />
          <VisitorTracker />
          <PageTracker />
          <ServiceWorkerRegister />
          <PwaInstallPrompt />
          <Toaster />
          {/* <SmoothScrollWrapper> */}
          <QueryProvider>{children}</QueryProvider>
          {/* </SmoothScrollWrapper> */}
        </AuthProvider>
      </body>
    </html>
  );
}
