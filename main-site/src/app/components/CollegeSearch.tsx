'use client';

import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '../../sanity/client';
import { GraduationCap, MapPin, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface College {
  _id: string;
  name: string;
  shortName: string;
  slug: { current: string };
  logo?: SanityImageSource;
  location: string;
  type: string;
}

interface CollegeSearchProps {
  colleges: College[];
}

export default function CollegeSearch({ colleges }: CollegeSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filteredColleges = useMemo(() => {
    return colleges.filter((college) => {
      const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.shortName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || college.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [colleges, searchTerm, filterType]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search colleges by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Government', 'Private'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filterType === type
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* College Grid */}
      {filteredColleges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college) => (
            <Link
              key={college._id}
              href={`/colleges/${college.slug.current}`}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-red-100 dark:hover:border-red-900/30 block"
            >
              {/* Top: Logo & Type */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 flex items-center justify-center">
                  {college.logo ? (
                    <Image
                      src={urlFor(college.logo).width(64).height(64).url()}
                      alt={`${college.name} logo`}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  ) : (
                    <GraduationCap className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${college.type === 'Government'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                  {college.type === 'Government' ? 'Govt' : college.type === 'Private' ? 'Private' : 'Semi-Govt'}
                </span>
              </div>

              {/* Middle: Name and Location */}
              <div className="mb-4">
                {/* FIX: Changed h3 to h2 to fix heading order hierarchy (h1 -> h2) */}
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {college.name}
                </h2>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-1" />
                  {college.location}
                </div>
              </div>

              {/* Bottom: View Profile Button */}
              {/* FIX: Changed text-gray-500 to text-gray-600 for better contrast */}
              <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                <span>View Profile</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-gray-400" />
          </div>
          {/* FIX: Changed h3 to h2 for consistency */}
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No colleges found</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}