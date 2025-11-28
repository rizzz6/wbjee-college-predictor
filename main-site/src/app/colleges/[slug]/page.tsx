import { client, urlFor } from '../../../sanity/client';
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from 'sanity';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
// FIX: Switched to Lucide Icons
import { MapPin, Building2, Calendar, Globe, Landmark, IndianRupee, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import SanityTable from '../../components/SanityTable';
import CutoffTable from '../../components/CutoffTable';

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
  fees?: {
    rows: {
      cells: string[]
    }[]
  };
  placements?: {
    rows: {
      cells: string[]
    }[]
  };
  cutoffs?: PortableTextBlock[];
  cutoffIdentifier?: string;
  body?: PortableTextBlock[];
  cutoffGroup?: {
    cutoffs: Array<{
      year: number;
      round: string;
      openingRank: number;
      closingRank: number;
      category: string;
      quota: string;
      program: string;
    }>
  }
}

export async function generateStaticParams() {
  const colleges = await client.fetch(`*[_type == 'college' && isVisible == true] { slug }`);
  return colleges.map((col: { slug: { current: string } }) => ({ slug: col.slug.current }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const college = await client.fetch(`*[_type == "college" && slug.current == $slug][0]{ name, coverImage }`, { slug });
  if (!college) return { title: 'College Not Found' };
  return {
    title: `${college.name} - 2026 Fees, Placements & Cutoff`,
    description: `Complete details for ${college.name}. Check fees, admission process, and placement statistics.`,
    alternates: {
      canonical: `/colleges/${slug}`,
    },
    openGraph: {
      images: college.coverImage ? [{ url: urlFor(college.coverImage).width(1200).height(630).url() }] : [],
    },
  };
}

export default async function CollegeProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const college = await client.fetch<College | null>(
    `*[_type == "college" && slug.current == $slug && isVisible == true][0]{
      ...,
      body,
      "cutoffGroup": *[_type == "collegeCutoff" && institute == coalesce(^.cutoffIdentifier, ^.name)][0]
    }`,
    { slug }
  );

  if (!college) notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">

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
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${college.type === 'Government' ? 'bg-green-700' : 'bg-gray-600'
                  }`}>
                  {college.type}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-2">
                {college.name}
              </h1>
              <div className="flex items-center text-gray-300 gap-2">
                <MapPin className="w-5 h-5" />
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
                <Globe className="w-5 h-5" />
                Official Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="container mx-auto px-6 py-12 max-w-7xl">

        {/* TOP SECTION: GRID (Content + Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-10">
            {/* About Section */}
            {college.body && (
              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-red-600"><Landmark className="w-6 h-6" /></span> About the Institute
                </h2>
                <div className="prose prose-red dark:prose-invert max-w-none">
                  <PortableText value={college.body} />
                </div>
              </section>
            )}
            {/* Fees Section */}
            {college.fees && (
              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-red-600"><IndianRupee className="w-6 h-6" /></span> Fee Structure
                </h2>
                <SanityTable data={college.fees} />
              </section>
            )}
            {/* Placements Section */}
            {college.placements && (
              <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-red-600"><TrendingUp className="w-6 h-6" /></span> Placements & Stats
                </h2>
                <SanityTable data={college.placements} />
              </section>
            )}
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                Quick Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                    <p className="text-gray-900 dark:text-gray-200 font-medium">{college.type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Established</p>
                    <p className="text-gray-900 dark:text-gray-200 font-medium">{college.estYear || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
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
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Visit Website <ArrowRight className="w-4 h-4" />
                </a>
              )}
              <Link
                href="/predictor"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <BarChart3 className="w-5 h-5" />
                Check Admission Probability
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: CUTOFFS (Full Width of Container) */}
        {/* This sits OUTSIDE the grid, but INSIDE the max-w-7xl container */}
        {college.cutoffGroup?.cutoffs && college.cutoffGroup.cutoffs.length > 0 && (
          <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-red-600"><BarChart3 className="w-6 h-6" /></span> Cutoff Trends (WBJEE)
            </h2>

            {/* Pass raw data to Client Component */}
            <CutoffTable cutoffs={college.cutoffGroup.cutoffs} />

            <p className="text-sm text-gray-500 mt-4 italic">
              * Data represents Opening & Closing Ranks for various rounds.
            </p>
          </section>
        )}
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Link
          href="/predictor"
          className="flex items-center justify-center gap-2 w-full bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-transform"
        >
          Check Admission Probability
        </Link>
      </div>
    </div>
  );
}