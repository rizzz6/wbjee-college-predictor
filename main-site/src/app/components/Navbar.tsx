"use client";

import { useState, useEffect } from "react";
import { SunIcon, MoonIcon, UserIcon } from "@heroicons/react/24/outline";
import { useAppTheme } from "../providers";

function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = theme === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
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
          <a href="/" className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
            r/wbjee Companion
          </a>

          <nav className="hidden md:flex items-center gap-6 text-gray-700 dark:text-gray-200">
            <a href="/#home" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Home</a>
            <a href="/#about" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">About</a>
            <a href="/#contact" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Contact</a>
            <a
              href="https://www.reddit.com/u/rizzz6"
            target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              <span className="text-gray-700 dark:text-gray-200">Contact u/rizzz6</span>
            </a>
            <ThemeToggle />
          </nav>

          <button
            aria-label="Toggle navigation"
            className="md:hidden p-2 rounded border border-gray-200 dark:border-gray-700"
            onClick={() => setOpen(v => !v)}
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col gap-3 text-gray-700 dark:text-gray-200">
              <a href="/#home" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>Home</a>
              <a href="/#about" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>About</a>
              <a href="/#contact" className="hover:text-red-600 dark:hover:text-red-400 transition-colors" onClick={() => setOpen(false)}>Contact</a>
              <a
                href="https://www.reddit.com/u/rizzz6"
          target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setOpen(false)}
              >
                <UserIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                <span>Contact u/rizzz6</span>
              </a>
              <ThemeToggle />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
