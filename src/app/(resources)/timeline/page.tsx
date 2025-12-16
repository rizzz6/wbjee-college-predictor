import ImportantDates from '../../components/ImportantDates';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WBJEE 2026 Important Dates & Schedule | Official Timeline',
  description: 'Track all important dates for WBJEE 2026 including application, admit card, exam date, result, and counseling schedule.',
  alternates: {
    canonical: '/timeline',
  },
  openGraph: {
    title: 'WBJEE 2026 Schedule & Important Dates',
    description: 'Complete timeline for WBJEE 2026: Application, Exam, Result, and Counseling dates.',
    url: 'https://www.rwbjee.com/timeline',
    type: 'website',
  }
}; // <--- MAKE SURE THIS CLOSING BRACE AND SEMICOLON ARE HERE

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Main Page Heading */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            WBJEE 2026 Schedule
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Stay updated with the complete schedule of events. Dates marked as &ldquo;Tentative&rdquo; are subject to change by the official board.
          </p>
        </div>

        {/* Render Full List without internal Header */}
        <div className="flex justify-center">
          <ImportantDates hideTitle={true} />
        </div>
      </div>
    </div>
  );
}