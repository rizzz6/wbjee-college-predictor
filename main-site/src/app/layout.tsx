import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./providers";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "r/wbjee Companion",
  description:
    "From WBJEE Rank to Dream College. Find your predicted college and join the discussion with the Reddit community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var t = localStorage.getItem('theme') || localStorage.getItem('wbjeeTheme') || 'light';
              var root = document.documentElement;
              root.classList.remove('light','dark');
              document.body && document.body.classList.remove('light','dark');
              if (t === 'dark') {
                root.classList.add('dark');
                document.body && document.body.classList.add('dark');
              }
              document.documentElement.style.colorScheme = t;
            } catch (err) {}
          `}
        </Script>
      </head>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
