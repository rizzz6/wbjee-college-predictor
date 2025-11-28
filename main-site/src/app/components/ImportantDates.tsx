'use client';

import { client } from '../../sanity/lib/client';
import useSWR from 'swr';
import { format, isPast, isToday, differenceInCalendarDays, startOfDay } from 'date-fns';
import Link from 'next/link';

const fetcher = (query: string) => client.fetch(query);

interface TimelineEvent {
  _id: string;
  title: string;
  date: string;
  isTentative: boolean;
}

interface ImportantDatesProps {
  limit?: number;
  showViewAll?: boolean;
  compact?: boolean;
  hideTitle?: boolean;
}

export default function ImportantDates({
  limit,
  showViewAll = false,
  compact = false,
  hideTitle = false
}: ImportantDatesProps) {

  const { data: allEvents, isLoading } = useSWR<TimelineEvent[]>(
    `*[_type == "timeline"] | order(date asc)`,
    fetcher
  );

  // LOGIC: Filter data if a limit is set
  const displayedEvents = allEvents ? (() => {
    if (!limit) return allEvents;
    const today = startOfDay(new Date());
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    });

    if (upcomingEvents.length > 0) {
      return upcomingEvents.slice(0, limit);
    }
    return allEvents.slice(-limit);
  })() : [];


  // SKELETON LOADER
  if (isLoading) return (
    <section className={`w-full ${!compact ? 'py-8' : ''}`}>
      <div className={`w-full ${!compact ? 'max-w-7xl mx-auto px-4' : ''}`}>
        {!hideTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Important Dates
            </h2>
          </div>
        )}
        <div className="flex flex-col gap-0 relative max-w-3xl">
          {Array.from({ length: limit || 5 }).map((_, i) => (
            <div key={i} className="flex pb-8 relative">
              <div className="relative flex-shrink-0 w-12 flex flex-col items-center">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 bg-gray-200 dark:bg-gray-800 h-full"></div>
                <div className="relative z-10 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 mt-1"></div>
              </div>
              <div className="flex-1 pl-4 pt-0.5">
                <div className="h-16 bg-gray-100 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (!displayedEvents || displayedEvents.length === 0) return null;

  return (
    // FIX: Using <section> and matching FeaturedColleges structure exactly (max-w-7xl mx-auto px-4)
    <section className={`w-full ${!compact ? 'py-8' : ''}`}>
      <div className={`w-full ${!compact ? 'max-w-7xl mx-auto px-4' : ''}`}>

        {/* HEADER: Full width, no max-w constraint */}
        {!hideTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Important Dates
            </h2>

            {showViewAll && (
              <Link
                href="/timeline"
                className="text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 transition-colors"
              >
                View Schedule <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </div>
        )}

        {/* LIST: We keep the list max-w-3xl so lines aren't too long, but Header stays wide */}
        <div className="max-w-3xl">
          <div className="flex flex-col gap-0 relative">
            {displayedEvents.map((event, index) => {
              const eventDate = new Date(event.date);
              const isEventPast = isPast(eventDate) && !isToday(eventDate);
              const isEventToday = isToday(eventDate);
              const daysLeft = differenceInCalendarDays(eventDate, new Date());

              const isActive = !isEventPast && index === 0;

              return (
                <div key={event._id} className="flex group relative pb-8 last:pb-0">

                  {/* LEFT COLUMN: GRAPHICS */}
                  <div className="relative flex-shrink-0 w-12 flex flex-col items-center">
                    {index !== displayedEvents.length - 1 && (
                      <div
                        className="absolute w-0.5 bg-gray-200 dark:bg-gray-700 left-1/2 -translate-x-1/2 z-0"
                        style={{ top: '12px', height: 'calc(100% + 20px)' }}
                      ></div>
                    )}
                    <div className="relative z-10 flex items-center justify-center mt-1">
                      {isActive ? (
                        <div className="relative flex items-center justify-center w-6 h-6">
                          <span className="absolute w-full h-full rounded-full bg-red-500 animate-ping opacity-20"></span>
                          <span className="relative w-3 h-3 rounded-full bg-red-600 ring-4 ring-white dark:ring-gray-900 shadow-md"></span>
                        </div>
                      ) : isEventPast ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600 ring-4 ring-white dark:ring-gray-900"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 ring-4 ring-white dark:ring-gray-900"></div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: CONTENT */}
                  <div className="flex-1 pt-0.5 pl-4">
                    <div className={`p-4 rounded-lg border transition-all duration-300 ${isActive
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 border-l-4 border-l-red-600 shadow-md'
                      : isEventPast
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-70 grayscale'
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'
                      }`}>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-sm font-bold ${isActive ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {format(eventDate, 'MMMM d, yyyy')}
                        </span>
                        {isEventToday ? (
                          <span className="text-xs bg-red-700 text-white px-2 py-0.5 rounded font-medium">Today</span>
                        ) : isEventPast ? (
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-medium">Done</span>
                        ) : (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-medium">{daysLeft} Days left</span>
                        )}
                        {event.isTentative && !isEventPast && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 px-2 py-0.5 rounded font-medium">Tentative</span>
                        )}
                      </div>
                      <h3 className={`text-base font-medium ${isEventPast ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                        {event.title}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}