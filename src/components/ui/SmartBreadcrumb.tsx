"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    name: string;
    href: string;
    position: number;
}

interface SmartBreadcrumbProps {
    // Optional: Override breadcrumb items completely
    customItems?: BreadcrumbItem[];

    // Optional: Override specific segments by URL path
    overrides?: Record<string, string>;

    // Optional: Hide visual breadcrumb (schema only)
    hideVisual?: boolean;

    // Optional: Custom base URL for schema
    baseUrl?: string;

    // Optional: Add custom class to nav element
    className?: string;
}

// Base URL for schema.org
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rwbjee.com';

// Custom readable names for specific routes
const ROUTE_LABELS: Record<string, string> = {
    'predictor': 'College Predictor',
    'cutoffs': 'Cutoffs',
    'colleges': 'Colleges',
    'blog': 'Blog',
    'timeline': 'Timeline',
    'faq': 'FAQ',
    'privacy': 'Privacy Policy',
    'disclaimer': 'Disclaimer',
    'socials': 'Social Links',
    'old-predictor': 'Legacy Predictor',
};

/**
 * Format a URL slug into a readable name
 * Examples:
 * - "cutoffs" → "Cutoffs"
 * - "jadavpur-university" → "Jadavpur University"
 */
function formatSlug(slug: string): string {
    // Check if we have a custom label
    if (ROUTE_LABELS[slug]) {
        return ROUTE_LABELS[slug];
    }

    // Format the slug: split on hyphens, capitalize each word
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Generate breadcrumb items from URL pathname
 */
function generateBreadcrumbs(
    pathname: string,
    overrides?: Record<string, string>
): BreadcrumbItem[] {
    // Always start with Home
    const items: BreadcrumbItem[] = [
        { name: 'Home', href: '/', position: 1 }
    ];

    // Normalize pathname: remove trailing slashes and handle edge cases
    const normalizedPath = pathname.replace(/\/+$/, '') || '/';

    // Don't generate breadcrumbs for home page
    // Handle cases: '/', '', '/index'
    if (normalizedPath === '/' || normalizedPath === '' || normalizedPath === '/index') {
        return [];
    }

    // Split pathname and filter out empty segments and 'index'
    const segments = pathname.split('/').filter(segment =>
        segment !== '' && segment !== 'index'
    );

    // If no valid segments after filtering, return empty (homepage)
    if (segments.length === 0) {
        return [];
    }

    // Build breadcrumbs for each segment
    let currentPath = '';
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;

        // Check for override first
        const name = overrides?.[currentPath] || formatSlug(segment);

        items.push({
            name,
            href: currentPath,
            position: index + 2
        });
    });

    return items;
}

/**
 * Generate JSON-LD Schema.org BreadcrumbList
 */
function generateBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items.map(item => ({
            '@type': 'ListItem',
            'position': item.position,
            'name': item.name,
            'item': `${baseUrl}${item.href}`
        }))
    };
}

/**
 * SmartBreadcrumb - Server Component
 * 
 * Automatically generates breadcrumbs with SEO schema based on current URL.
 * Can be used globally in layout or on specific pages.
 * 
 * @example
 * // In layout.tsx
 * <SmartBreadcrumb />
 * 
 * @example
 * // With custom overrides
 * <SmartBreadcrumb 
 *   overrides={{
 *     '/colleges/jadavpur-university': 'Jadavpur University (JU)'
 *   }}
 * />
 */
export default function SmartBreadcrumb({
    customItems,
    overrides,
    hideVisual = false,
    baseUrl = BASE_URL,
    className = '',
}: SmartBreadcrumbProps = {}) {
    // Get current pathname from Next.js navigation hook (client-side)
    const pathname = usePathname();

    // Use custom items if provided, otherwise generate from URL
    const breadcrumbItems = customItems || generateBreadcrumbs(pathname, overrides);

    // Don't render anything on home page
    if (breadcrumbItems.length === 0) {
        return null;
    }

    // Generate schema
    const schema = generateBreadcrumbSchema(breadcrumbItems, baseUrl);

    return (
        <>
            {/* Visual Breadcrumb Navigation */}
            {!hideVisual && (
                <nav
                    aria-label="Breadcrumb"
                    className={`
            bg-white dark:bg-gray-900 
            border-b border-gray-200 dark:border-gray-700
            ${className}
          `.trim()}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <ol className="flex items-center flex-wrap gap-2 text-sm">
                            {breadcrumbItems.map((item, index) => {
                                const isLast = index === breadcrumbItems.length - 1;
                                const isHome = item.href === '/';

                                return (
                                    <li
                                        key={item.href}
                                        className="flex items-center gap-2"
                                    >
                                        {/* Separator (except for first item) */}
                                        {index > 0 && (
                                            <ChevronRight
                                                className="w-4 h-4 text-gray-400 dark:text-gray-600"
                                                aria-hidden="true"
                                            />
                                        )}

                                        {/* Breadcrumb Link or Text */}
                                        {isLast ? (
                                            // Current page - not a link, bold
                                            <span
                                                className="
                          font-semibold 
                          text-gray-900 dark:text-white
                          truncate max-w-[150px] sm:max-w-[250px] md:max-w-none
                        "
                                                aria-current="page"
                                                title={item.name}
                                            >
                                                {isHome && <Home className="w-4 h-4" aria-label="Home" />}
                                                {!isHome && item.name}
                                            </span>
                                        ) : (
                                            // Parent pages - clickable links
                                            <Link
                                                href={item.href}
                                                className="
                          flex items-center gap-1
                          text-gray-600 dark:text-gray-400 
                          hover:text-red-600 dark:hover:text-red-400
                          transition-colors
                          truncate max-w-[120px] sm:max-w-[200px] md:max-w-none
                        "
                                                title={item.name}
                                                data-breadcrumb-position={item.position}
                                            >
                                                {isHome && <Home className="w-4 h-4" aria-label="Home" />}
                                                {!isHome && item.name}
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </nav>
            )}

            {/* SEO: JSON-LD Structured Data Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(schema)
                }}
                suppressHydrationWarning
            />
        </>
    );
}

// Export utility functions for advanced use cases
export {
    generateBreadcrumbs,
    generateBreadcrumbSchema,
    formatSlug,
    type BreadcrumbItem,
    type SmartBreadcrumbProps
};
