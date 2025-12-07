import type { Metadata } from "next";
import FAQ from '../../components/FAQDedicated';

export const metadata: Metadata = {
  title: "FAQ - WBJEE College Predictor",
  description: "Frequently asked questions about WBJEE college prediction, counseling process, tools, and admission requirements. Get answers to common queries about our college predictor and WBJEE 2025.",
  keywords: [
    "WBJEE FAQ",
    "WBJEE College Predictor FAQ",
    "WBJEE counseling FAQ",
    "college predictor FAQ",
    "WBJEE admission questions",
    "WBJEE 2025 FAQ",
    "engineering admission FAQ"
  ],
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: "FAQ - WBJEE College Predictor",
    description: "Frequently asked questions about WBJEE college prediction, counseling process, tools, and admission requirements.",
    url: "https://www.rwbjee.com/faq",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "FAQ - WBJEE College Predictor",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - WBJEE College Predictor",
    description: "Frequently asked questions about WBJEE college prediction, counseling process, tools, and admission requirements.",
    images: ["/og-image.svg"],
  },
};

export default function FAQPage() {
  return <FAQ />;
}