'use client';

import { Star } from 'lucide-react';

/**
 * Help content component for the Predictor tool
 * Contains usage guide, prediction explanations, and keyboard shortcuts
 */
export function HelpContent() {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="font-semibold text-xl mb-4 text-slate-900 dark:text-slate-100">How to Use WBJEE College Predictor 2026</h4>
                <ul className="list-disc list-outside ml-5 space-y-2 text-slate-700 dark:text-slate-300">
                    <li className="leading-relaxed">Enter your WBJEE 2026 rank in the input field and get instant college predictions for engineering admission in West Bengal</li>
                    <li className="leading-relaxed">Use advanced filtering options to find specific engineering branches at Jadavpur University, Calcutta University, or other top WBJEE-participating colleges</li>
                    <li className="leading-relaxed">Click the star (<Star className="w-3 h-3 inline text-yellow-500" />) to add colleges to your shortlist for detailed comparison of admission chances</li>
                    <li className="leading-relaxed">Click on any table row to view historical WBJEE cutoff trends and rank analysis charts</li>
                    <li className="leading-relaxed">Export your personalized college list as CSV or share your results with friends preparing for WBJEE counseling</li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-xl mb-4 text-slate-900 dark:text-slate-100">Prediction Guide</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-100 text-xs font-semibold border border-emerald-300 dark:border-emerald-700">Confirm</span>
                        <span className="text-slate-700 dark:text-slate-300 text-sm">Your rank is better than opening rank</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 text-xs font-semibold border border-blue-300 dark:border-blue-700">Great</span>
                        <span className="text-slate-700 dark:text-slate-300 text-sm">Top 30% of admitted batch</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                        <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-100 text-xs font-semibold border border-cyan-300 dark:border-cyan-700">Good</span>
                        <span className="text-slate-700 dark:text-slate-300 text-sm">Within closing rank (admitted range)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-100 text-xs font-semibold border border-amber-300 dark:border-amber-700">Borderline</span>
                        <span className="text-slate-700 dark:text-slate-300 text-sm">Within dynamic buffer (max 5k ranks)</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg col-span-1 sm:col-span-2">
                        <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-100 text-xs font-semibold border border-red-300 dark:border-red-700">No Chance</span>
                        <span className="text-slate-700 dark:text-slate-300 text-sm">Beyond dynamic buffer threshold</span>
                    </div>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-xl mb-4 text-slate-900 dark:text-slate-100">Prediction Confidence</h4>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                    Each prediction comes with a confidence indicator. Click the <strong>ℹ️ info icon</strong> next to any prediction badge to see:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 mb-3">
                    <li><strong>Confidence Level</strong> - How certain the prediction is (Very High/High/Good/Moderate/Limited)</li>
                    <li><strong>Percentage Score</strong> - Numerical confidence (0-100%)</li>
                    <li><strong>Reasoning</strong> - Clear explanation of why you got this prediction</li>
                </ul>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>How it&apos;s calculated:</strong> We use a hybrid approach combining your distance from thresholds (60%) and the competitiveness of the program (40%) to give you the most accurate confidence score.
                    </p>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-xl mb-4 text-slate-900 dark:text-slate-100">Result Filtering</h4>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                    Enable result filtering to automatically show only colleges where you have a realistic chance of admission based on your rank.
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Result filtering</strong> uses advanced algorithms to filter colleges based on historical cutoff trends and your specific rank range.
                    </p>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-xl mb-4 text-slate-900 dark:text-slate-100">Keyboard Shortcuts</h4>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-slate-700 dark:text-slate-300 text-sm">Toggle theme</span>
                            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Ctrl+Shift+D</kbd>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-slate-700 dark:text-slate-300 text-sm">Focus rank input</span>
                            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Ctrl+K</kbd>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-slate-700 dark:text-slate-300 text-sm">Show favorites</span>
                            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Ctrl+F</kbd>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-slate-700 dark:text-slate-300 text-sm">Close modals</span>
                            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Escape</kbd>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-slate-700 dark:text-slate-300 text-sm">Toggle result filtering</span>
                            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Ctrl+R</kbd>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-slate-700 dark:text-slate-300 text-sm">Show filters</span>
                            <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Ctrl+Shift+F</kbd>
                        </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                        <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Navigation Shortcuts</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Skip to main content</span>
                                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Tab</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Navigate table rows</span>
                                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">↑↓</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Activate row/enter</span>
                                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Enter</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Select/deselect</span>
                                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Space</kbd>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Tip:</strong> Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded font-mono">Tab</kbd> when the page loads to access skip navigation links for quick navigation to different sections.
                    </div>
                </div>
            </div>
        </div>
    );
}
