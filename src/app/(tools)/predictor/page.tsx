import type { Metadata } from "next";
import NewPredictorClient from "./NewPredictorClient";
import FAQWidget from "@/components/content/FAQWidget";

// Page-specific metadata for SEO
export const metadata: Metadata = {
  title: "WBJEE College Predictor 2026 | Find Your Best Engineering College",
  description: "Enter your WBJEE rank and instantly find your admission chances. Compare Jadavpur, CU, and top engineering colleges with detailed cutoff trends and branch analysis.",
  alternates: {
    canonical: '/predictor',
  },
  openGraph: {
    title: "WBJEE College Predictor 2026 | Find Your Best Engineering College",
    description: "Enter your WBJEE rank and instantly find your admission chances. Compare Jadavpur, CU, and top engineering colleges with detailed cutoff trends and branch analysis.",
    url: "https://www.rwbjee.com/predictor",
    siteName: "rwbjee",
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
};


const predictorFAQData = [
  {
    q: "How to use WBJEE College Predictor 2026?",
    a: "Enter your WBJEE rank in the input field and get instant college predictions for engineering admission in West Bengal. Use advanced filtering options to find specific engineering branches at Jadavpur University, Calcutta University, or other top WBJEE-participating colleges."
  },
  {
    q: "What is the difference between this React predictor and the original version?",
    a: "This React version offers enhanced features including advanced filtering, real-time search, chart visualizations, comparison tools, auto-save preferences, keyboard shortcuts, and improved mobile experience."
  },
  {
    q: "How accurate is the WBJEE college prediction?",
    a: "The predictions are based on historical WBJEE cutoff data from official sources. While we strive for accuracy, actual cutoffs may vary each year depending on factors like exam difficulty, number of applicants, and seat availability."
  },
  {
    q: "What does the result filtering feature do?",
    a: "Result filtering automatically shows only colleges where you have a realistic chance of admission based on your rank. It uses advanced algorithms to filter colleges based on historical cutoff trends and your specific rank range."
  },
  {
    q: "Can I export my results and share them?",
    a: "Yes! You can export your filtered results or shortlist to CSV format, share results via link, copy results as text, or copy college codes. All export options are available in the Export & Share dropdown."
  },
  {
    q: "What are the keyboard shortcuts available?",
    a: "Available shortcuts: Ctrl+Shift+D (toggle theme), Ctrl+K (focus rank input), Ctrl+F (show favorites), Escape (close modals). Use Tab to navigate through interactive elements."
  }
];

// 2. Generate Schema dynamically from the data above
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": predictorFAQData.map(item => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.a
    }
  }))
};

// Server component that exports metadata and renders client component
export default function NewPredictorPage() {
  return (
    <>
      {/* FAQ Schema for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />

      <NewPredictorClient />

      <section className="bg-white dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <FAQWidget data={predictorFAQData} title="Frequently Asked Questions" />
        </div>
      </section>
    </>
  );
}