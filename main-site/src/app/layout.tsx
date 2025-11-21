import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  verification: {
    google: "your-google-site-verification-code",
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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-Y5WXZ7Q4Q2"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Y5WXZ7Q4Q2');
            `,
          }}
        />

        {/* Theme initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme') || localStorage.getItem('wbjeeTheme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
