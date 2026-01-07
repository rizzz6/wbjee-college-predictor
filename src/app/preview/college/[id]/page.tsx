import { client, urlFor } from '@/sanity/client';
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from 'sanity';
import Image from 'next/image';
import { MapPin, Building2, Calendar, Globe, IndianRupee, TrendingUp, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import SanityTable from '@/components/content/SanityTable';
import CutoffTable from '@/components/content/CutoffTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SanityImage {
    asset: { _ref: string; _type: string; };
    _type: 'image';
}

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
    highlights?: string[];
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
            seatType?: string;
            program: string;
        }>
    }
}

export default async function CollegePreview({
    params
}: {
    params: { id: string }
}) {
    // FIXED: Prioritize drafts using order()
    const college = await client.fetch<College>(
        `*[_id in [$id, "drafts." + $id]] 
     | order(_id match "drafts.*" desc)[0]{
      name,
      shortName,
      location,
      type,
      estYear,
      website,
      logo,
      coverImage,
      description,
      highlights,
      body,
      fees,
      feeStructure,
      placements,
      cutoffIdentifier,
      "cutoffGroup": *[_type == "collegeCutoff" && institute == ^.cutoffIdentifier][0]{
        cutoffs[]{
          year, round, openingRank, closingRank, 
          category, quota, seatType, program
        }
      }
    }`,
        { id: params.id },
        // CRITICAL: No caching for draft content
        { cache: 'no-store' }
    )

    if (!college) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2 text-gray-900">College Not Found</h1>
                    <p className="text-gray-600">Document ID: {params.id}</p>
                    <p className="text-sm text-gray-500 mt-2">Make sure the document exists and try again</p>
                </div>
            </div>
        )
    }

    // Render with draft banner
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Draft Preview Banner */}
            <div className="bg-yellow-500 text-black px-4 py-3 text-center font-bold sticky top-0 z-50 shadow-md">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">📝</span>
                    <span>DRAFT PREVIEW - Changes not published to live site</span>
                </div>
            </div>

            {/* College Page Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                    {college.coverImage && (
                        <div className="relative h-64 md:h-80">
                            <Image
                                src={urlFor(college.coverImage).width(1200).height(400).url()}
                                alt={`${college.name} Campus`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6">
                            {college.logo && (
                                <div className="flex-shrink-0">
                                    <Image
                                        src={urlFor(college.logo).width(120).height(120).url()}
                                        alt={`${college.name} Logo`}
                                        width={120}
                                        height={120}
                                        className="rounded-lg"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {college.name}
                                </h1>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                    {college.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin size={16} />
                                            <span>{college.location}</span>
                                        </div>
                                    )}
                                    {college.type && (
                                        <div className="flex items-center gap-1">
                                            <Building2 size={16} />
                                            <span>{college.type}</span>
                                        </div>
                                    )}
                                    {college.estYear && (
                                        <div className="flex items-center gap-1">
                                            <Calendar size={16} />
                                            <span>Est. {college.estYear}</span>
                                        </div>
                                    )}
                                    {college.website && (
                                        <a
                                            href={college.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-blue-600 hover:underline"
                                        >
                                            <Globe size={16} />
                                            <span>Website</span>
                                        </a>
                                    )}
                                </div>

                                {college.description && (
                                    <p className="text-gray-700">{college.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highlights */}
                {college.highlights && college.highlights.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="text-green-600" />
                            Key Highlights
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {college.highlights.map((highlight, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <ArrowRight className="text-blue-600 flex-shrink-0 mt-1" size={16} />
                                    <span className="text-gray-700">{highlight}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* About */}
                {college.body && college.body.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the College</h2>
                        <div className="prose max-w-none">
                            <PortableText value={college.body} />
                        </div>
                    </div>
                )}

                {/* Fee Structure */}
                {college.fees && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <IndianRupee className="text-green-600" />
                            Fee Structure
                        </h2>
                        <SanityTable data={college.fees} caption={`${college.name} Fee Structure`} />
                    </div>
                )}

                {/* Placements */}
                {college.placements && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="text-blue-600" />
                            Placement Statistics
                        </h2>
                        <SanityTable data={college.placements} caption={`${college.name} Placement Statistics`} />
                    </div>
                )}

                {/* Cutoffs */}
                {college.cutoffGroup && college.cutoffGroup.cutoffs && college.cutoffGroup.cutoffs.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="text-purple-600" />
                            Previous Year Cutoffs
                        </h2>
                        <CutoffTable cutoffs={college.cutoffGroup.cutoffs} />
                    </div>
                )}
            </div>
        </div>
    )
}
