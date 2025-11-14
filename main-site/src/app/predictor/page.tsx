import type { Metadata } from "next";
import NewPredictorClient from "./NewPredictorClient";

// Page-specific metadata for SEO
export const metadata: Metadata = {
  title: "WBJEE College Predictor - React Version with Charts & Filters",
  description: "Use our React-based WBJEE college predictor with real-time filtering, trend charts, comparison tools, and detailed admission analysis. Find the best engineering colleges in West Bengal for your rank with interactive visualizations and smart recommendations.",
  keywords: [
    "WBJEE college predictor",
    "WBJEE React predictor",
    "college trend charts",
    "engineering admission predictor",
    "WBJEE rank analysis tool",
    "interactive college finder",
    "WBJEE cutoff trends",
    "engineering college comparison",
    "smart filtering predictor",
    "WBJEE admission chances"
  ],
  alternates: {
    canonical: '/predictor',
  },
  openGraph: {
    title: "WBJEE College Predictor - React Version with Charts",
    description: "Experience our React-based predictor with advanced filtering, trend analysis, and college comparison tools for precise WBJEE admission planning.",
    url: "https://www.rwbjee.com/predictor",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "WBJEE College Predictor with React interface and interactive charts",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WBJEE College Predictor - React Version",
    description: "React-based WBJEE predictor with charts, filters, and trend analysis for admissions.",
    images: ["/og-image.svg"],
  },
};

// Breadcrumb structured data for SEO
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.rwbjee.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "WBJEE College Predictor",
      "item": "https://www.rwbjee.com/predictor"
    }
  ]
};

// FAQ Schema for Rich Snippets
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How to use WBJEE College Predictor 2025?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Enter your WBJEE rank in the input field and get instant college predictions for engineering admission in West Bengal. Use advanced filtering options to find specific engineering branches at Jadavpur University, Calcutta University, or other top colleges."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between this React predictor and the original version?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This React version offers enhanced features including advanced filtering, real-time search, chart visualizations, comparison tools, auto-save preferences, keyboard shortcuts, and improved mobile experience."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate is the WBJEE college prediction?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The predictions are based on historical WBJEE cutoff data from official sources. While we strive for accuracy, actual cutoffs may vary each year depending on factors like exam difficulty, number of applicants, and seat availability."
      }
    },
    {
      "@type": "Question",
      "name": "What does the result filtering feature do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Result filtering automatically shows only colleges where you have a realistic chance of admission based on your rank. It uses advanced algorithms to filter colleges based on historical cutoff trends and your specific rank range."
      }
    },
    {
      "@type": "Question",
      "name": "Can I export my results and share them?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! You can export your filtered results or shortlist to CSV format, share results via link, copy results as text, or copy college codes. All export options are available in the Export & Share dropdown."
      }
    },
    {
      "@type": "Question",
      "name": "What are the keyboard shortcuts available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Available shortcuts: Ctrl+Shift+D (toggle theme), Ctrl+K (focus rank input), Ctrl+F (show favorites), Escape (close modals). Use Tab to navigate through interactive elements."
      }
    }
  ]
};

// Server component that exports metadata and renders client component
export default function NewPredictorPage() {
  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      {/* FAQ Schema for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />

      <NewPredictorClient />
    </>
  );
}