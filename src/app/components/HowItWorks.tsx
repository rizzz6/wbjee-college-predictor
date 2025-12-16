"use client";

import { LazyMotion, domAnimation, m, type Variants } from "framer-motion";
import { Pencil, BarChart3, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const card: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 220, damping: 24 },
    },
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <section id="how-it-works" className="w-full py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get your college prediction in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Step 1 */}
            <m.div
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              // MOBILE: flex-row, text-left, p-4
              // DESKTOP: flex-col, text-center, p-6
              className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-4 md:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* ICON: Smaller margin-right on mobile, margin-bottom on desktop */}
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mr-4 md:mr-0 md:mb-6">
                <Pencil className="w-6 h-6 md:w-7 md:h-7" />
              </div>

              {/* CONTENT WRAPPER */}
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1 md:mb-3">
                  1. Enter Your Rank
                </h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Input your WBJEE GMR rank and select your category (General, SC, ST, OBC).
                </p>
              </div>
            </m.div>

            {/* Step 2 */}
            <m.div
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-4 md:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4 md:mr-0 md:mb-6">
                <BarChart3 className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1 md:mb-3">
                  2. View Analysis
                </h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Our algorithm analyzes past year cutoffs to show you probable colleges.
                </p>
              </div>
            </m.div>

            {/* Step 3 */}
            <m.div
              variants={card}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-4 md:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 mr-4 md:mr-0 md:mb-6">
                <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-1 md:mb-3">
                  3. Shortlist
                </h3>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Save your favorite colleges to a shortlist and compare them.
                </p>
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}