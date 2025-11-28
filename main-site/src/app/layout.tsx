import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTagManager } from '@next/third-parties/google';
import EasterEggManager from './components/eastereggs/EasterEggManager';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "WBJEE College Predictor 2025 - Free College Finder Tool",
  description:
    "Free WBJEE college predictor tool 2025. Find engineering colleges and branches in West Bengal based on your WBJEE rank. Get detailed analysis, cutoff trends, admission chances, and college comparison for Jadavpur University, Calcutta University, and other top engineering colleges. Instant results, mobile-friendly, and completely free to use.",
  keywords: [
    "WBJEE 2025",
    "WBJEE college finder",
    "WBJEE rank predictor",
    "WBJEE college predictor",
    "WBJEE cutoff 2025",
    "engineering colleges West Bengal",
    "WBJEE admission",
    "WBJEE rank calculator",
    "WBJEE college list",
    "WBJEE branch finder",
    "Jadavpur University",
    "Calcutta University",
    "engineering admission West Bengal",
    "WBJEE counseling",
    "WBJEE rank analysis",
    "WBJEE seat allotment",
    "WBJEE merit list",
    "engineering colleges Kolkata",
    "WBJEE 2025 cutoff",
    "WBJEE admission process"
  ],
  authors: [{ name: "rizzz6" }],
  creator: "rizzz6",
  publisher: "WBJEE College Predictor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.rwbjee.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "WBJEE College Predictor 2025 - Free College Finder Tool",
    description:
      "Free WBJEE college predictor tool 2025. Find engineering colleges and branches in West Bengal based on your WBJEE rank. Get detailed analysis, cutoff trends, admission chances, and college comparison for Jadavpur University, Calcutta University, and other top engineering colleges.",
    url: "https://www.rwbjee.com",
    siteName: "WBJEE College Predictor",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "WBJEE College Predictor - Find Your Perfect Engineering College",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WBJEE College Predictor 2025 - Free College Finder Tool",
    description:
      "Free WBJEE college predictor tool 2025. Find engineering colleges and branches in West Bengal based on your WBJEE rank...",
    images: ["/og-image.svg"],
    creator: "@rizzz6",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },

  },

  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://ytfxpldt.apicdn.sanity.io" crossOrigin="anonymous" />

        {/* FIX: Added inline styles to the script to force the background immediately. 
            We used backticks (`) correctly here to prevent TypeScript errors. */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'theme';
                  var classNameDark = 'dark';
                  
                  function setClassOnDocumentBody(darkMode) {
                    var html = document.documentElement;
                    if (darkMode) {
                      html.classList.add(classNameDark);
                      html.style.backgroundColor = '#111827'; 
                      html.style.color = '#ffffff';
                    } else {
                      html.classList.remove(classNameDark);
                      html.style.backgroundColor = '#ffffff';
                      html.style.color = '#111827';
                    }
                  }
                  
                  var localStorageTheme = null;
                  try {
                    localStorageTheme = localStorage.getItem(storageKey) || localStorage.getItem('wbjeeTheme');
                  } catch (err) {}
                  
                  var localStorageExists = localStorageTheme !== null;
                  if (localStorageExists) {
                    localStorageTheme = JSON.parse(localStorageTheme);
                  }

                  if (localStorageExists) {
                    setClassOnDocumentBody(localStorageTheme === 'dark');
                  } else {
                    var isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setClassOnDocumentBody(isDarkMode);
                  }
                } catch (err) {}
              })();
            `,
          }}
        />

        {/* FIX: Added a CSS fallback that runs BEFORE the script as a safety net */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media (prefers-color-scheme: dark) {
            html { background-color: #111827; color: white; }
          }
        `}} />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-900 dark:text-white`}>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <EasterEggManager />

          {process.env.NODE_ENV === 'production' && <SpeedInsights />}
        </Providers>
        <GoogleTagManager gtmId="GTM-5789Z287" />
      </body>
    </html>
  );
}