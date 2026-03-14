"use client";

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export interface FAQItem {
  q: string | React.ReactNode;
  a: string | React.ReactNode;
}

interface FAQWidgetProps {
  data: FAQItem[];
  title?: string;
  footer?: React.ReactNode; // Optional slot for "View All" link
}

export default function FAQWidget({ data, title = "Frequently Asked Questions", footer }: FAQWidgetProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="w-full">
      {/* Dynamic Title */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        {title}
      </h2>

      <div className="w-full space-y-4">
        {data.map((item, idx) => {
          const isOpen = openIdx === idx;
          const contentId = `faq-content-${idx}`;
          return (
            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <button
                className="w-full flex justify-between items-start text-left group focus:outline-none"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={contentId}
              >
                <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400'}`}>
                  {item.q}
                </span>
                <span className="ml-6 flex-shrink-0 pt-1">
                  {isOpen ? (
                    <Minus className="w-5 h-5 text-red-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                  )}
                </span>
              </button>

              <div
                id={contentId}
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 pt-4" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.a}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Footer (View All Link) */}
      {footer && (
        <div className="mt-8">
          {footer}
        </div>
      )}
    </div>
  );
}