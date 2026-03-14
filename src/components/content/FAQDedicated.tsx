"use client";

import React, { useState } from "react";



const faqData = [
  {
    category: "General Questions",
    questions: [
      {
        q: "What is WBJEE?",
        a: "WBJEE stands for West Bengal Joint Entrance Examination. It is a state-level entrance exam for admission to undergraduate engineering, pharmacy, and architecture courses in West Bengal.",
      },
      {
        q: "Is this the official WBJEE website?",
        a: (
          <>
            No, this is not the official WBJEE website. This site is an independent resource to help students with tools, predictors, and information. For official updates, always refer to{" "}
            <a href="https://wbjeeb.nic.in/" target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 underline hover:text-red-800 dark:hover:text-red-300">wbjeeb.nic.in</a>.
          </>
        ),
      },
      {
        q: "What is the eligibility criteria for WBJEE 2026?",
        a: "Candidates must have passed (or be appearing in) the 10+2 examination with Physics and Mathematics along with Chemistry/Biology/Biotechnology/Computer Science as compulsory subjects. There are also minimum marks and age requirements. Please check the official brochure for detailed criteria.",
      },
    ],
  },
  {
    category: "Tools & Predictors",
    questions: [
      {
        q: "How accurate is the rank predictor?",
        a: "The rank predictor uses previous years’ data and statistical models to estimate your probable rank or college. While it provides a good indication, actual results may vary due to changes in exam patterns, competition, and other factors.",
      },
      {
        q: "Where does the cutoff data come from?",
        a: "Cutoff data is sourced from official WBJEE counseling releases and participating institutes. We strive to keep the data updated and accurate, but always cross-check with official sources.",
      },
    ],
  },
  {
    category: "Counseling Process",
    questions: [
      {
        q: "What happens during WBJEE counseling?",
        a: "During counseling, candidates register, fill in their choices of colleges and branches, and are allotted seats based on their rank, preferences, and seat availability. The process includes document verification and fee payment.",
      },
      {
        q: "What is the difference between Round 1 and Round 2?",
        a: "Round 1 is the initial seat allotment. In Round 2, candidates who did not get a seat or wish to upgrade can participate again. Vacant seats from Round 1 are filled in Round 2, and seat upgrades may occur based on preferences and availability.",
      },
    ],
  },
];

export default function FAQDedicated() {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const handleToggle = (catIdx: number, qIdx: number) => {
    const key = `${catIdx}-${qIdx}`;
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-4 md:px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
            Frequently Asked <span className="text-red-600">Questions</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Find answers to common questions about WBJEE and our tools
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqData.map((cat, catIdx) => (
            <div
              key={cat.category}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Category Header */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {cat.category}
                </h2>
              </div>

              {/* Questions */}
              <div className="p-6">
                <div className="space-y-4">
                  {cat.questions.map((item, qIdx) => {
                    const key = `${catIdx}-${qIdx}`;
                    const isOpen = !!open[key];
                    const contentId = `faq-dedicated-content-${key}`;
                    return (
                      <div
                        className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0"
                        key={key}
                      >
                        <button
                          className="w-full flex justify-between items-start gap-4 py-3 text-left group"
                          aria-expanded={isOpen}
                          aria-controls={contentId}
                          onClick={() => handleToggle(catIdx, qIdx)}
                        >
                          <span className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {item.q}
                          </span>
                          <span
                            className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold transform transition-transform duration-300 ${isOpen ? "rotate-45" : ""
                              }`}
                          >
                            +
                          </span>
                        </button>
                        <div
                          id={contentId}
                          className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                        >
                          <div className="overflow-hidden">
                            <div className="pt-3 pb-1 text-gray-600 dark:text-gray-300 leading-relaxed">
                              {item.a}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}