"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Menu, X } from 'lucide-react'
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAppTheme } from "../providers";

function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // 1. Exact Size Skeleton (34px height, 84px width)
  if (!mounted) {
    return (
      <div
        className="h-[34px] w-[84px] rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 animate-pulse"
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      // 2. Force the button to match the skeleton exactly
      className="inline-flex h-[34px] w-[84px] items-center justify-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-ring"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
            r/wbjee Companion
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-gray-700 dark:text-gray-200">
            <Link href="/#home" className="hover:text-red-600 dark:hover:text-red-400 transition-colors rounded focus-ring px-1">Home</Link>
            <Link href="/colleges" className="hover:text-red-600 dark:hover:text-red-400 transition-colors rounded focus-ring px-1">Colleges</Link>
            <Link href="/predictor" className="hover:text-red-600 dark:hover:text-red-400 transition-colors rounded focus-ring px-1">Predictor</Link>
            <a
              href="/old-predictor/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors rounded focus-ring px-1"
            >
              Legacy Predictor
              <span className="sr-only"> (opens in new tab)</span>
              <span aria-hidden="true"> ↗</span>
            </a>            <Link href="/cutoffs" className="hover:text-red-600 dark:hover:text-red-400 transition-colors rounded focus-ring px-1">Cutoffs</Link>
            <Link href="/blog" className="hover:text-red-600 dark:hover:text-red-400 transition-colors rounded focus-ring px-1">Blog</Link>
            <ThemeToggle />
          </nav>



          <button
            aria-label="Toggle navigation"
            className="md:hidden p-2 rounded border border-gray-200 dark:border-gray-700 focus-ring"
            onClick={() => setOpen(v => !v)}
          >
            <LazyMotion features={domAnimation}>
              <m.div
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {open ? <X className="w-6 h-6 text-gray-700 dark:text-gray-200" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />}
              </m.div>
            </LazyMotion>
          </button>
        </div>

        <LazyMotion features={domAnimation}>
          <AnimatePresence>
            {open && (
              <m.div
                className="md:hidden absolute top-16 left-0 w-full bg-white/80 dark:bg-gray-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden px-4 pb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <nav className="flex flex-col gap-3 text-gray-700 dark:text-gray-200">
                  <Link href="/#home" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>Home</Link>
                  <Link href="/colleges" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>Colleges</Link>
                  <Link href="/predictor" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>Predictor</Link>
                  <a
                    href="/old-predictor/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    Legacy Predictor
                    <span className="sr-only"> (opens in new tab)</span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                  <Link href="/cutoffs" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>Cutoffs</Link>
                  <Link href="/blog" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>Blog</Link>
                  <ThemeToggle />
                </nav>
              </m.div>
            )}
          </AnimatePresence>
        </LazyMotion>
      </div>
    </header>
  );
}
