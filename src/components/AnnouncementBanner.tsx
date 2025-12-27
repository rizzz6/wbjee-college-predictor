'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

interface AnnouncementProps {
    message: string
    linkUrl?: string
    linkText?: string
    variant: 'info' | 'warning' | 'alert'
}

export function AnnouncementBanner({ message, linkUrl, linkText = 'Learn More', variant }: AnnouncementProps) {
    const [isDismissed, setIsDismissed] = useState(false)

    if (isDismissed) return null

    const variantStyles = {
        info: 'bg-blue-600 text-white',
        warning: 'bg-yellow-500 text-gray-900',
        alert: 'bg-red-600 text-white',
    }

    return (
        <div className={`${variantStyles[variant]} px-4 py-3 relative`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <p className="text-sm font-medium flex-1">
                    {message}
                    {linkUrl && (
                        <a
                            href={linkUrl}
                            className="ml-2 underline font-semibold hover:opacity-80 transition-opacity"
                        >
                            {linkText} →
                        </a>
                    )}
                </p>
                <button
                    onClick={() => setIsDismissed(true)}
                    className="ml-4 hover:opacity-75 transition-opacity flex-shrink-0"
                    aria-label="Dismiss announcement"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    )
}
