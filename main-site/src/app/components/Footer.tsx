import Link from "next/link";
import { User } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* MAIN FOOTER CONTENT */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-12">

          {/* COLUMN 1: Content & Info */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-col items-start gap-2 text-gray-700 dark:text-gray-200">
              <Link href="/blog" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Blog</Link>
              <Link href="/colleges" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">College List</Link>
              <Link href="/timeline" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Important Dates</Link>
            </div>
          </div>

          {/* COLUMN 2: Tools & Predictors */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-col items-start gap-2 text-gray-700 dark:text-gray-200">
              <Link href="/predictor" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Rank Predictor</Link>
              <Link href="/rank-finder" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Cutoff Finder</Link>
              <a
                href="/old-predictor/index.html"
                className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Legacy Predictor
              </a>
            </div>
          </div>

          {/* COLUMN 3: Socials & Contact */}
          <div className="flex flex-col items-start gap-3">
            {/* Socials Link */}
            <Link href="/socials" className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              Socials
            </Link>

            {/* Contact Button */}
            <a
              href="https://www.reddit.com/u/rizzz6"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <User className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              <span className="text-gray-700 dark:text-gray-200">Contact u/rizzz6</span>
            </a>
          </div>

          {/* COLUMN 4: Legal Links */}
          <div className="flex flex-col items-start gap-3">
            {/* Legal Links - Stack vertically on all screens */}
            <div className="flex flex-col items-start gap-2 text-gray-700 dark:text-gray-200">
              <Link href="/faq" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">FAQ</Link>
              <Link href="/privacy" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Privacy Policy</Link>
              <Link href="/disclaimer" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Disclaimer</Link>
            </div>
          </div>

        </div>

        {/* FOOTNOTE */}
        <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
          {/* Copyright */}
          <div className="text-gray-600 dark:text-gray-300 mb-4">
            © {new Date().getFullYear()} r/wbjee Companion. Built by{' '}
            <a
              href="https://www.reddit.com/u/rizzz6"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              u/rizzz6
            </a>
            .
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center md:text-left">
              For any queries or suggestions, feel free to reach out on Reddit.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">#Aazadi</p>
          </div>
        </div>
      </div>
    </footer>
  );
}