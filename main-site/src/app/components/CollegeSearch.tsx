'use client';

import { useState, useMemo } from 'react';
import { urlFor } from '../../sanity/client';
import Link from 'next/link';
import { MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import Image from 'next/image';

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
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {['All', 'Government', 'Private'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === type
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Colleges Grid */}
      {filteredColleges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college) => (
            <Link
              key={college._id}
              href={`/colleges/${college.slug.current}`}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Top Row: Logo and Type Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 flex-shrink-0">
                  {college.logo ? (
                    <Image
                      src={urlFor(college.logo).width(48).height(48).url()}
                      alt={`${college.name} logo`}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">🏫</span>
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  college.type === 'Government'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : college.type === 'Private'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                }`}>
                  {college.type === 'Government' ? 'Govt' : college.type === 'Private' ? 'Private' : 'Semi-Govt'}
                </span>
              </div>

              {/* Middle: Name and Location */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {college.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {college.location}
                </div>
              </div>

              {/* Bottom: View Profile Button */}
              <div className="flex items-center justify-between text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                <span>View Profile</span>
                <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No colleges found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}