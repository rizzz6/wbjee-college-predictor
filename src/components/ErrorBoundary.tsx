'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary component to catch React errors and prevent full page crashes
 * 
 * Wraps components that might throw errors and provides fallback UI with recovery options.
 * Logs errors to console and can be extended to send to error tracking services (Sentry, etc.)
 * 
 * @example
 * <ErrorBoundary>
 *   <SomeComponentThatMightCrash />
 * </ErrorBoundary>
 * 
 * @example With custom fallback
 * <ErrorBoundary fallback={<div>Custom error UI</div>}>
 *   <SomeComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error);
        console.error('[ErrorBoundary] Error info:', errorInfo);

        Sentry.captureException(error, {
            extra: {
                componentStack: errorInfo.componentStack,
            }
        });
    }

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">
                            Something went wrong
                        </h2>
                        <p className="text-red-700 dark:text-red-300 mb-4">
                            {this.state.error?.message || 'An unexpected error occurred while loading this component.'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false, error: undefined })}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
