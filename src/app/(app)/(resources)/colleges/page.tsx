import CollegeSearch from '@/components/features/CollegeSearch';
import { Metadata } from 'next';
import { PageHero } from '@/components/layout/PageHero';
import { getPayloadClient } from '@/lib/payload-client';

export const revalidate = 86400; // 24 hours ISR

export const metadata: Metadata = {
  title: "List of All Engineering Colleges in West Bengal | WBJEE 2026 Directory",
  description: "Browse the complete database of engineering colleges for WBJEE 2026. Check detailed fee structures, placement stats, and cutoff trends for Government & Private institutes.",
  alternates: { canonical: '/colleges' },
  openGraph: {
    title: "WBJEE College Directory 2026 - All Govt & Private Institutes",
    description: "Access the full list of West Bengal engineering colleges. Compare fees, cutoffs, and placement records for every institute.",
    url: "https://www.rwbjee.com/colleges",
    siteName: "rwbjee",
    type: "website",
    images: [{ url: "/assets/tools/colleges-og.png", width: 1200, height: 630, alt: "WBJEE 2026 Engineering College Directory" }],
  }
};

export default async function CollegesPage() {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: 'colleges',
    where: { isVisible: { equals: true } },
    sort: 'priority,type,name',
    limit: 500,
    pagination: false,
  });

  // Map to the shape CollegeSearch expects
  const colleges = res.docs.map((doc) => ({
    _id: String(doc.id),
    name: doc.name,
    shortName: doc.shortName || '',
    slug: { current: doc.slug },
    logo: doc.logo && typeof doc.logo === 'object' && 'url' in doc.logo
      ? { url: (doc.logo as { url: string }).url }
      : undefined,
    location: doc.location || '',
    type: doc.type || '',
    priority: doc.priority || 3,
  }));

  return (
    <div className="bg-white dark:bg-gray-900">
      <PageHero
        title={{ main: 'West Bengal', accent: 'Engineering Colleges' }}
        description="Explore detailed profiles of engineering colleges in West Bengal. Find the perfect fit for your WBJEE journey."
      />
      <div className="px-4 pb-12">
        <CollegeSearch colleges={colleges} />
      </div>
    </div>
  );
}