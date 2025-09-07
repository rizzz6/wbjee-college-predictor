import React, { useState } from "react";

const faqHomeData = [
  {
    q: "Is this the official WBJEE site?",
    a: (
      <>
        No, this is not the official WBJEE website. For official information, visit{" "}
        <a href="https://wbjeeb.nic.in/" target="_blank" rel="noopener noreferrer" className="text-red-600 underline hover:text-red-800">wbjeeb.nic.in</a>.
      </>
    ),
  },
  {
    q: "How accurate is the predictor?",
    a: "The predictor uses previous years’ data to estimate your probable rank or college. Actual results may vary. Use it as a guide, not a guarantee.",
  },

];

export default function FAQAccordionHome() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          {faqHomeData.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div className="border-b border-gray-200 dark:border-gray-700" key={idx}>
                <button
                  className="w-full flex justify-between items-center py-4 text-left text-lg font-semibold text-gray-800 dark:text-white"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                >
                  <span>{item.q}</span>
                  <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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
        <div className="mt-8 text-center">
          <a href="/faq" className="text-red-600 underline hover:text-red-800">
            View All FAQs
          </a>
        </div>
      </div>
    </section>
  );
}
