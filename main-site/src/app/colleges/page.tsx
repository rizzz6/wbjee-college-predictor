import { client } from '../../sanity/lib/client';
import CollegeSearch from '@/app/components/CollegeSearch';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { Metadata } from 'next'; // <--- THIS WAS MISSING

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
  title: "List of Engineering Colleges in West Bengal | WBJEE Predictor",
  description: "Explore detailed profiles of engineering colleges in West Bengal. Filter by location, type, and cutoffs to find the perfect fit for your WBJEE journey.",
  alternates: {
    canonical: '/colleges',
  },
  openGraph: {
    title: "West Bengal Engineering Colleges List",
    description: "Complete list of engineering colleges participating in WBJEE.",
    url: "https://www.rwbjee.com/colleges",
  }
};

export default async function CollegesPage() {
  const colleges: College[] = await client.fetch(
    `*[_type == "college" && isVisible == true] | order(priority asc, type asc, name asc) { _id, name, shortName, slug, logo, location, type, priority }`
  );

  return (
    <div className="px-6 md:px-12 py-12">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
          West Bengal <span className="text-red-600">Engineering Colleges</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
          Explore detailed profiles of engineering colleges in West Bengal. Find the perfect fit for your WBJEE journey.
        </p>
      </div>

      {/* Search and Filter Component */}
      <CollegeSearch colleges={colleges} />
    </div>
  );
}