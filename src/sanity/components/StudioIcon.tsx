'use client'

import React from 'react'

/**
 * Custom Studio Icon Component
 * Displays the rwbjee logo in the Sanity Studio navbar
 * Uses dangerouslySetInnerHTML to avoid Next.js Image lint warnings
 * while still loading the actual logo.svg file
 */
export default function StudioIcon() {
    // Load the logo SVG dynamically on mount
    const [logoSvg, setLogoSvg] = React.useState<string>('')

    React.useEffect(() => {
        fetch('/assets/logo.svg')
            .then(res => res.text())
            .then(svg => setLogoSvg(svg))
            .catch(() => {
                // Fallback if logo fails to load
                console.warn('Failed to load logo.svg')
            })
    }, [])

    if (!logoSvg) {
        // Loading state or fallback
        return <div style={{ width: '100%', height: '100%', background: '#dc2626' }} />
    }

    return (
        <div
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: logoSvg }}
        />
    )
}
