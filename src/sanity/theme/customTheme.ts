import { buildLegacyTheme } from 'sanity'

/**
 * Custom theme for rwbjee Sanity Studio
 * Matches the brand colors from the main site
 */

// Brand colors extracted from the main site
const colors = {
    // Primary brand color (red accent)
    brand: {
        primary: '#dc2626', // red-600
        primaryHover: '#b91c1c', // red-700
        primaryActive: '#991b1b', // red-800
    },
    // Background colors
    bg: {
        light: '#ffffff',
        dark: '#111827', // gray-900
        darkSecondary: '#1f2937', // gray-800
    },
    // Text colors
    text: {
        light: '#111827',
        dark: '#f9fafb', // gray-50
        muted: '#6b7280', // gray-500
    },
}

// Dark theme configuration
export const customTheme = buildLegacyTheme({
    // Base colors - Dark mode
    '--black': colors.text.dark,
    '--white': colors.bg.dark,

    // Gray palette
    '--gray': colors.text.muted,
    '--gray-base': colors.text.muted,

    // Brand color
    '--brand-primary': colors.brand.primary,

    // Component defaults - Dark backgrounds
    '--component-bg': colors.bg.darkSecondary,
    '--component-text-color': colors.text.dark,

    // State colors
    '--state-info-color': '#3b82f6',
    '--state-success-color': '#10b981',
    '--state-warning-color': '#f59e0b',
    '--state-danger-color': colors.brand.primary,

    // Focus
    '--focus-color': colors.brand.primary,

    // Main navigation - Dark
    '--main-navigation-color': colors.bg.dark,
    '--main-navigation-color--inverted': colors.text.dark,
})

// Light theme variant (optional, can be switched in config)
export const customLightTheme = buildLegacyTheme({
    // Base colors - Light mode
    '--black': colors.text.light,
    '--white': colors.bg.light,

    // Gray palette
    '--gray': colors.text.muted,
    '--gray-base': colors.text.muted,

    // Brand color
    '--brand-primary': colors.brand.primary,

    // Component defaults - Light backgrounds
    '--component-bg': colors.bg.light,
    '--component-text-color': colors.text.light,

    // State colors
    '--state-info-color': '#3b82f6',
    '--state-success-color': '#10b981',
    '--state-warning-color': '#f59e0b',
    '--state-danger-color': colors.brand.primary,

    // Focus
    '--focus-color': colors.brand.primary,

    // Main navigation - Light
    '--main-navigation-color': colors.bg.light,
    '--main-navigation-color--inverted': colors.text.light,
})

// Optional: Export color values for consistent use
export { colors }
