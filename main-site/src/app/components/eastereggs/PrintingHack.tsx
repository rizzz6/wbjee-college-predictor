'use client';

import { useEffect, useState } from 'react';
import { X, Printer } from 'lucide-react';

// FIX: Moved outside component to avoid re-creation on every render
const SECRET_CODE = ['p', 'r', 'i', 'n', 't'];

export default function PrintingHack() {
    // FIX: Removed unused 'keySequence' variable (replaced with empty comma)
    const [, setKeySequence] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Safety Check: Don't trigger if user is typing in a search box/input
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                document.activeElement?.getAttribute('contenteditable') === 'true'
            ) {
                return;
            }

            const key = e.key.toLowerCase();

            setKeySequence((prev) => {
                const updated = [...prev, key].slice(-SECRET_CODE.length);

                if (JSON.stringify(updated) === JSON.stringify(SECRET_CODE)) {
                    setIsOpen(true);
                    return []; // Reset history
                }
                return updated;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border-2 border-red-600 overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-red-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <Printer className="w-6 h-6" />
                        <h3 className="font-bold text-lg tracking-wide uppercase">Seat Allotment Letter</h3>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-3xl">🎉</span>
                    </div>

                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider mb-1">
                            Provisional Seat Allocation
                        </p>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                            Jadavpur University
                        </h2>
                        <p className="text-xl font-medium text-red-600 dark:text-red-400 mt-1">
                            Printing Engineering
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-sm space-y-2 border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-500">GMR Rank:</span>
                            <span className="font-mono font-bold">69,420</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Quota:</span>
                            <span className="font-semibold text-emerald-600">Emotional Support</span>
                        </div>
                    </div>

                    {/* FIX: Escaped double quotes */}
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic pt-2">
                        &quot;Printing is the CSE of the soul.&quot;
                    </p>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:opacity-90 transition-opacity mt-2"
                    >
                        Accept & Freeze (No Option)
                    </button>
                </div>
            </div>
        </div>
    );
}