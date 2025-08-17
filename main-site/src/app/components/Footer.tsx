import { UserIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-600 dark:text-gray-300">
            © 2025 r/wbjee Companion. Built by{' '}
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
          <div className="flex items-center gap-6 text-gray-700 dark:text-gray-200">
            <a href="/privacy" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Privacy Policy</a>
            <a href="/disclaimer" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Disclaimer</a>
          </div>
        </div>
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            For any queries or suggestions, feel free to reach out on Reddit.
          </p>
          <a
              href="https://www.reddit.com/u/rizzz6"
            target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <UserIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
              <span className="text-gray-700 dark:text-gray-200">Contact u/rizzz6</span>
            </a>
          <p className="text-sm text-gray-500 dark:text-gray-400">#Aazadi</p>
        </div>
      </div>
    </footer>
  );
}