'use client';
import { client } from '../../sanity/lib/client';
import useSWR from 'swr';
import { format, isPast, isToday, differenceInCalendarDays } from 'date-fns';

const fetcher = (query: string) => client.fetch(query);

interface TimelineEvent {
  _id: string;
  title: string;
  date: string;
  isTentative: boolean;
}

const SkeletonItem = () => (
  <div className="flex">
    <div className="flex flex-col items-center w-12 mr-4">
      <div className="h-8 flex items-center justify-center shrink-0">
        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
      </div>
      <div className="w-0.5 flex-1 -my-1 bg-gray-200 dark:bg-gray-700"></div>
    </div>
    <div className="flex-1 pb-12">
      <div className="p-5 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function ImportantDates() {
  const { data: events, isLoading } = useSWR<TimelineEvent[]>(
    '*[_type == "timeline"] | order(date asc)',
    fetcher
  );

  // SKELETON LOADER
  if (isLoading) return (
    <>
      <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">Important Dates</h2>
      <div className="flex flex-col">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </div>
    </>
  );

  if (!events || events.length === 0) return null;

  // Calculate Active State
  const firstActiveIndex = events.findIndex(e => !isPast(new Date(e.date)) || isToday(new Date(e.date)));
  const activeIndex = firstActiveIndex === -1 ? events.length - 1 : firstActiveIndex;

  return (
    <>
      <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100">Important Dates</h2>
      <div className="flex flex-col">
        {events.map((event, index) => {
          const eventDate = new Date(event.date);
          const isEventPast = isPast(eventDate) && !isToday(eventDate);
          const isEventToday = isToday(eventDate);
          const isActive = index === activeIndex;
          const isLast = index === events.length - 1;

          // Calculate Days Left
          const daysLeft = differenceInCalendarDays(eventDate, new Date());
          return (
            <div key={event._id} className="flex">

              {/* LEFT COLUMN: GRAPHICS */}
              <div className="flex flex-col items-center w-12 mr-4">
                <div className="h-8 flex items-center justify-center shrink-0">
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
                <div className={`w-0.5 flex-1 -my-1 ${isLast ? 'bg-transparent' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              </div>
              {/* RIGHT COLUMN: CONTENT */}
              <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-12'}`}>
                <div className={`p-5 rounded-lg border transition-all duration-300 ${
                  isActive
                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 border-l-4 border-l-red-600 shadow-md'
                    : isEventPast
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 opacity-70'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'
                }`}>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-sm font-bold ${isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {format(eventDate, 'MMMM d, yyyy')}
                    </span>

                    {/* TAGS LOGIC */}
                    {isEventToday ? (
                       <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded font-medium animate-pulse">Happening Today</span>
                    ) : isEventPast ? (
                       <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-medium">Completed</span>
                    ) : (
                       <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-medium">
                          In {daysLeft} Days
                       </span>
                    )}
                    {event.isTentative && !isEventPast && (
                       <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 px-2 py-0.5 rounded font-medium">Expected</span>
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
    </>
  );
}