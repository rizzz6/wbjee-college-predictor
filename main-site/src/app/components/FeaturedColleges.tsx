import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '../../sanity/lib/image';
import { MapPinIcon } from '@heroicons/react/24/outline';
<<<<<<< HEAD
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
=======
>>>>>>> bf35035ad1ba25850dd9dac4d61da8f1024f556a

interface College {
  _id: string;
  name: string;
  slug: { current: string };
<<<<<<< HEAD
  logo?: SanityImageSource;
=======
  logo?: any;
>>>>>>> bf35035ad1ba25850dd9dac4d61da8f1024f556a
  location: string;
  shortName?: string;
}

export default function FeaturedColleges({ colleges }: { colleges: College[] }) {
  if (!colleges || colleges.length === 0) return null;

  return (
    <section className="w-full py-8">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* HEADER ROW */}
        <div className="flex items-center justify-between mb-6">
          {/* Fixed Size: text-2xl to match Important Dates */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Featured Colleges
          </h2>
          <Link
            href="/colleges"
            className="text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 transition-colors"
          >
            View Directory <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* GRID */}
        <div className="flex flex-wrap justify-center gap-4">
          {colleges.map((col) => (
            <Link
              key={col._id}
              href={`/colleges/${col.slug.current}`}
              className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-300 w-full sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)]"
            >
              <div className="w-20 h-20 mb-4 relative flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
                {col.logo ? (
                  <Image
                    src={urlFor(col.logo).width(150).url()}
                    alt={col.shortName || col.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-3xl">🎓</span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-2 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {col.shortName || col.name}
              </h3>

              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-auto font-medium">
                <MapPinIcon className="w-3 h-3" />
                <span className="line-clamp-1">{col.location}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}