'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-9xl md:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 dark:from-red-500 dark:to-red-300 leading-none">
                        404
                    </h1>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        Looks like you&apos;ve ventured into uncharted territory. The page you&apos;re looking for doesn&apos;t exist or may have been moved.
                    </p>
                </div>

                {/* Navigation Options */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>

                    <Link
                        href="/predictor"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                    >
                        <Search className="w-5 h-5" />
                        College Predictor
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>

                {/* Popular Links */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                        Popular Pages
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            href="/colleges"
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                            Colleges
                        </Link>
                        <Link
                            href="/cutoffs"
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                            Cutoffs
                        </Link>
                        <Link
                            href="/blog"
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                            Blog
                        </Link>
                        <Link
                            href="/timeline"
                            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                        >
                            Timeline
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
