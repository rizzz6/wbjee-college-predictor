import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - WBJEE College Predictor",
  description: "Read our privacy policy for the WBJEE College Predictor tool. Learn how we collect, use, and protect your data when using our college prediction service.",
  keywords: [
    "WBJEE privacy policy",
    "WBJEE College Predictor privacy",
    "data protection policy",
    "college predictor privacy",
    "rwbjee.com privacy"
  ],
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: "Privacy Policy - WBJEE College Predictor",
    description: "Read our privacy policy for the WBJEE College Predictor tool. Learn how we collect, use, and protect your data.",
    url: "https://www.rwbjee.com/privacy",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Privacy Policy - WBJEE College Predictor",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - WBJEE College Predictor",
    description: "Read our privacy policy for the WBJEE College Predictor tool.",
    images: ["/og-image.svg"],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

      <p className="mt-4 mb-6">
        <strong>r/wbjee companion</strong> (&quot;us,&quot; &quot;we,&quot; or &quot;our&quot;) operates the <strong>rwbjee.com</strong> website (the &quot;Service&quot;). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
      </p>

      {/* FIX: Changed h4 to h2 for correct heading hierarchy (H1 -> H2) */}
      <h2 className="text-lg font-bold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-6">
        We may collect the following types of information:
        <br /><br />
        <strong>Non-Personal Data:</strong> Like most website operators, we may collect information that your browser sends whenever you visit our Service. This may include your browser type, IP address, the pages you visit, and other diagnostic data, which is used for analytics.
        <br /><br />
        <strong>Personal Data:</strong> We only collect personally identifiable information (like your name or email address) when you voluntarily provide it to us, for example, by using a contact form. You are not required to provide personal information to browse this site.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">2. Use of Cookies</h2>
      <p className="mb-6">
        A cookie is a small file placed on your device. We may use cookies to track activity on our Service and hold certain information. This helps us analyze web traffic and improve our website. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">3. How We Use Your Information</h2>
      <p className="mb-6">
        We use the collected data for various purposes: to provide and maintain our Service, to improve user experience, to monitor usage and prevent abuse, and to respond to your inquiries.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">4. Data Sharing and Disclosure</h2>
      <p className="mb-6">
        We do not sell, trade, or rent your personal identification information to others. We will not disclose your personal data unless required to do so by law.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">5. Data Security</h2>
      <p className="mb-6">
        The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee its absolute security.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">6. Children&apos;s Privacy</h2>
      <p className="mb-6">
        Our Service is intended for students, some of whom may be under the age of 18. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us so we can take appropriate action.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">7. Links to Other Websites</h2>
      <p className="mb-6">
        Our Service may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party&apos;s site. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">8. Changes to This Privacy Policy</h2>
      <p className="mb-6">
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2 className="text-lg font-bold mt-6 mb-2">9. Contact Us</h2>
      <p className="mb-6">
        If you have any questions about this Privacy Policy, please contact us by email: <strong>rizzz6v@gmail.com</strong>
      </p>

      <p className="mt-8">
        <strong>Last Updated:</strong> August 17, 2025
      </p>

    </div>
  );
}