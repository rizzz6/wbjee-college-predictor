import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | WBJEE College Predictor",
  description: "Read our disclaimer and terms of use for the WBJEE College Predictor tool. Important information about our unofficial college prediction service, data accuracy, and limitations.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: '/disclaimer',
  },
  openGraph: {
    title: "Disclaimer | WBJEE College Predictor",
    description: "Read our disclaimer and terms of use for the WBJEE College Predictor tool.",
    url: "https://www.rwbjee.com/disclaimer",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Disclaimer - WBJEE College Predictor",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer | WBJEE College Predictor",
    description: "Read our disclaimer and terms of use for the WBJEE College Predictor tool.",
    images: ["/og-image.svg"],
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Disclaimer</h1>

      {/* FIX: Changed h4 to h2 to maintain H1 -> H2 hierarchy */}
      <h2 className="text-lg font-bold mt-6 mb-2">1. Not Official or Affiliated with WBJEE</h2>
      <p className="mb-6">
        This Site is an unofficial, student-run community resource. It is not affiliated with, endorsed by, or in any way officially connected with the &quot;West Bengal Joint Entrance Examinations Board (WBJEEB)&quot; or any of its subsidiaries or its affiliates. The official WBJEE website can be found at [wbjeeb.nic.in]. The name &quot;WBJEE&quot; is a trademark of the WBJEEB.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">2. No Professional Advice</h2>
      <p className="mb-6">
        The information on this Site is not intended as, and shall not be understood or construed as, professional academic, career, or legal advice. The content, including study materials, tips, and user comments, represents personal opinions and shared knowledge from the community. You should consult with a qualified professional before making any decisions based on the information provided here. Your reliance on any information on this Site is solely at your own risk.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">3. Rank and Admission Predictions</h2>
      <p className="mb-6">
        The Site may include tools, articles, or user discussions that provide predictions regarding college admissions, cutoff ranks, or scores for the WBJEE. These predictions are based purely on <strong>historical data, past trends, and community-sourced information.</strong> This information is speculative in nature and is provided for reference purposes only. <strong>It is NOT a guarantee of admission</strong> or a guarantee of any specific outcome. Admission cutoffs and outcomes are subject to change each year based on numerous factors, including the number of applicants, the difficulty of the examination, and changes in college admission policies. Users should treat these predictions as educated estimates and are advised to consult official sources and make their own informed decisions during the counseling process.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">4. User-Generated Content</h2>
      <p className="mb-6">
        This Site may include content and comments posted by users of the community. The views and opinions expressed in this user-generated content are those of the authors and do not necessarily reflect our official policy or position. We are not responsible for any user-generated content and do not guarantee its accuracy or reliability.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">5. External Links</h2>
      <p className="mb-6">
        The Site may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us. We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the Site.
      </p>

      <p className="mt-8">
        <strong>Last Updated:</strong> August 17, 2026
      </p>

    </div>
  );
}