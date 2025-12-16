interface PageHeroProps {
    title: {
        main: string;
        accent?: string;
    };
    description: string;
    badge?: string;
    className?: string;
    children?: React.ReactNode;
}

/**
 * PageHero - Standardized hero section component
 * 
 * Provides consistent spacing (px-6 md:px-12 py-12 mb-12) across all pages
 * while allowing customization via className and children props.
 * 
 * @example
 * <PageHero
 *   title={{ main: 'WBJEE', accent: 'College Predictor' }}
 *   description="Find your perfect engineering college..."
 * />
 * 
 * @example With custom spacing
 * <PageHero
 *   title={{ main: 'Blog', accent: 'Updates' }}
 *   description="..."
 *   className="mb-20"
 * />
 */
export function PageHero({
    title,
    description,
    badge,
    className = '',
    children
}: PageHeroProps) {
    return (
        <div className={`max-w-4xl mx-auto text-center mb-3 px-4 py-9 ${className}`}>
            {badge && (
                <div className="inline-block p-2 px-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium mb-4">
                    {badge}
                </div>
            )}

            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
                {title.main}
                {title.accent && (
                    <> <span className="text-red-600">{title.accent}</span></>
                )}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {description}
            </p>

            {children}
        </div>
    );
}
