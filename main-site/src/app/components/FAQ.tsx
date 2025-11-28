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
            <a href="https://wbjeeb.nic.in/" target="_blank" rel="noopener noreferrer" className="text-red-600 underline hover:text-red-800">wbjeeb.nic.in</a>.
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

export default function FAQ() {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const handleToggle = (catIdx: number, qIdx: number) => {
    setOpen((prev) => {
      const key = `${catIdx}-${qIdx}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
          Frequently Asked Questions
        </h1>
        {faqData.map((cat, catIdx) => (
          <div key={cat.category}>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mt-12 mb-6">
              {cat.category}
            </h2>
            {cat.questions.map((item, qIdx) => {
              const key = `${catIdx}-${qIdx}`;
              const isOpen = !!open[key];
              return (
                <div className="border-b border-gray-200 dark:border-gray-700" key={key}>
                  <button
                    className="w-full flex justify-between items-center py-4 text-left text-lg font-semibold text-gray-800 dark:text-white"
                    aria-expanded={isOpen}
                    onClick={() => handleToggle(catIdx, qIdx)}
                  >
                    <span>{item.q}</span>
                    <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="py-4 text-gray-600 dark:text-gray-300">{item.a}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}