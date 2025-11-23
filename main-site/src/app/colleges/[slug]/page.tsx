import { client, urlFor } from '../../../sanity/client';
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from 'sanity';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MapPinIcon, BuildingLibraryIcon, CalendarDaysIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

// 1. Define a proper type for Sanity Images
interface SanityImage {
  asset: { _ref: string; _type: string; };
  _type: 'image';
}

// 2. Use proper types in the main Interface
interface College {
  name: string;
  shortName?: string;
  location: string;
  type: string;
  estYear?: number;
  website?: string;
  logo?: SanityImage;
  coverImage?: SanityImage;
  description?: string;
  fees?: PortableTextBlock[];
  placements?: PortableTextBlock[];
  cutoffs?: PortableTextBlock[];
}

export async function generateStaticParams() {
  const colleges = await client.fetch(`*[_type == 'college'] { slug }`);
  return colleges.map((col: { slug: { current: string } }) => ({ slug: col.slug.current }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const college = await client.fetch(`*[_type == "college" && slug.current == $slug][0]{ name }`, { slug });
  if (!college) return { title: 'College Not Found' };
  return {
    title: `${college.name} - 2026 Fees, Placements & Cutoff`,
    description: `Complete details for ${college.name}. Check fees, admission process, and placement statistics.`,
  };
}

export default async function CollegeProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const college = await client.fetch<College | null>(
    `*[_type == "college" && slug.current == $slug][0]`,
    { slug }
  );

  if (!college) notFound();

  return (
    <div>
      {/* HERO HEADER */}
      <div className="relative h-[300px] md:h-[400px] bg-gray-900">
        {college.coverImage ? (
          <div className="absolute inset-0 opacity-60">
            <Image
              src={urlFor(college.coverImage).width(1200).height(600).url()}
              fill
              className="object-cover"
              alt="Campus"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-90"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

        <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* LOGO */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl p-2 shadow-xl shrink-0">
              {college.logo ? (
                <Image
                  src={urlFor(college.logo).width(200).url()}
                  alt={college.name}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-xl text-2xl font-bold text-gray-400">
                  {college.shortName?.[0]}
                </div>
              )}
            </div>

            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                {college.shortName && (
                  <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {college.shortName}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  college.type === 'Government' ? 'bg-green-600' : 'bg-gray-600'
                }`}>
                  {college.type}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-2">
                {college.name}
              </h1>
              <div className="flex items-center text-gray-300 gap-2">
                <MapPinIcon className="w-5 h-5" />
                {college.location}
              </div>
            </div>
            {college.website && (
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                <GlobeAltIcon className="w-5 h-5" />
                Official Website
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT: MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-10">

            {/* FEES SECTION */}
            {college.fees && (
              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-red-600">₹</span> Fee Structure
                </h2>
                <div className="prose prose-red dark:prose-invert max-w-none prose-table:border prose-th:bg-gray-50 dark:prose-th:bg-gray-700 prose-td:p-3">
                  <PortableText value={college.fees} />
                </div>
              </section>
            )}
            {/* PLACEMENTS SECTION */}
            {college.placements && (
              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-red-600">📈</span> Placements & Stats
                </h2>
                <div className="prose prose-red dark:prose-invert max-w-none">
                  <PortableText value={college.placements} />
                </div>
              </section>
            )}
             {/* CUTOFFS SECTION */}
            {college.cutoffs && (
              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-red-600">🎯</span> Cutoff Trends
                </h2>
                <div className="prose prose-red dark:prose-invert max-w-none">
                  <PortableText value={college.cutoffs} />
                </div>
              </section>
            )}
          </div>
          {/* RIGHT: SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Quick Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BuildingLibraryIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                    <p className="text-gray-900 dark:text-gray-200 font-medium">{college.type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Established</p>
                    <p className="text-gray-900 dark:text-gray-200 font-medium">{college.estYear || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                    <p className="text-gray-900 dark:text-gray-200 font-medium">{college.location}</p>
                  </div>
                </div>
              </div>
              {college.website && (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full block text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Visit Website ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}