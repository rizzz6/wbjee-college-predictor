import { client } from '../../../sanity/lib/client';
import CollegeSearch from '@/app/components/CollegeSearch';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { Metadata } from 'next';
import { PageHero } from '../../components/PageHero';

export const revalidate = 60;

interface College {
  _id: string;
  name: string;
  shortName: string;
  slug: { current: string };
  logo?: SanityImageSource;
  location: string;
  type: string;
  priority: number;
}

export const metadata: Metadata = {
  title: "List of All Engineering Colleges in West Bengal | WBJEE 2026 Directory",
  description: "Browse the complete database of engineering colleges for WBJEE 2026. Check detailed fee structures, placement stats, and cutoff trends for Government & Private institutes.",
  alternates: {
    canonical: '/colleges',
  },
  openGraph: {
    title: "WBJEE College Directory 2026 - All Govt & Private Institutes",
    description: "Access the full list of West Bengal engineering colleges. Compare fees, cutoffs, and placement records for every institute.",
    url: "https://www.rwbjee.com/colleges",
    siteName: "rwbjee",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "West Bengal Engineering Colleges List",
      },
    ],
  }
};

export default async function CollegesPage() {
  const colleges: College[] = await client.fetch(
    `*[_type == "college" && isVisible == true] | order(priority asc, type asc, name asc) { _id, name, shortName, slug, logo, location, type, priority }`
  );

  return (
    /* FIX: Added 'min-h-screen' and explicit 'bg-white dark:bg-gray-900' to force correct theme background */
    <div className="bg-white dark:bg-gray-900">

      {/* Hero Section */}
      <PageHero
        title={{ main: 'West Bengal', accent: 'Engineering Colleges' }}
        description="Explore detailed profiles of engineering colleges in West Bengal. Find the perfect fit for your WBJEE journey."
      />

      {/* Search and Filter Component */}
      <div className="px-4 pb-12">
        <CollegeSearch colleges={colleges} />
      </div>
    </div>
  );
}