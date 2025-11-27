'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';

const faqHomeData = [
  {
    q: "Is this the official WBJEE site?",
    a: (
      <>
        No, this is a free community resource. For official updates, always visit{" "}
        <a href="https://wbjeeb.nic.in/" target="_blank" rel="noopener noreferrer" className="text-red-600 underline hover:text-red-800">wbjeeb.nic.in</a>.
      </>
    ),
  },
  {
    q: "How accurate is the rank predictor?",
    a: "It uses previous years' cutoff data (2023-2024) to estimate chances. While highly accurate for trends, actual cutoffs vary every year based on difficulty and number of candidates.",
  },
  {
    q: "Is the college data up to date?",
    a: "Yes, we have updated the fees and placement stats for the 2024-2025 session based on the latest available reports from the institutes.",
  },
];

export default function FAQAccordionHome() {
  const [openIdx, setOpenIdx] = useState<number | null>(0); // Open first one by default

  return (
    <>
      {/* Left Aligned Heading */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Frequently Asked Questions
      </h2>
      {/* Left Aligned Content Wrapper */}
      <div className="w-full">
        {faqHomeData.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700">
              <button
                className="w-full flex justify-between items-start py-5 text-left focus:outline-none"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
              >
                <span className={`text-lg font-medium ${isOpen ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {item.q}
                </span>
                <span className="ml-6 flex-shrink-0">
                  {isOpen ? (
                    // FIX: Replaced MinusIcon with Minus
                    <Minus className="w-5 h-5 text-red-600" />
                  ) : (
                    // FIX: Replaced PlusIcon with Plus
                    <Plus className="w-5 h-5 text-gray-400" />
                  )}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-48 opacity-100 pb-5" : "max-h-0 opacity-0"
                  }`}
              >
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          );
        })}
        {/* Left Aligned Footer Link */}
        <div className="mt-8">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
          >
            View All FAQs <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </>
  );
}
