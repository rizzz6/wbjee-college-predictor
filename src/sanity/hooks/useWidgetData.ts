// useWidgetData - Optimized data fetching hook with caching
// For consistent data fetching patterns across widgets

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useClient } from 'sanity'
import { apiVersion } from '../env'

interface CacheEntry {
    data: unknown
    timestamp: number
}

// Simple in-memory cache
const dataCache = new Map<string, CacheEntry>()

interface UseWidgetDataOptions<T = unknown> {
    query: string
    params?: Record<string, unknown>
    cacheKey?: string
    cacheDuration?: number // in milliseconds, default 60 seconds
    enabled?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
}

interface UseWidgetDataResult<T> {
    data: T | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    isStale: boolean
}

export function useWidgetData<T = unknown>({
    query,
    params = {},
    cacheKey,
    cacheDuration = 60000, // 1 minute default
    enabled = true,
    onSuccess,
    onError
}: UseWidgetDataOptions): UseWidgetDataResult<T> {
    const client = useClient({ apiVersion })
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isStale, setIsStale] = useState(false)
    const abortControllerRef = useRef<AbortController | null>(null)

    // Generate cache key if not provided
    const paramsKey = JSON.stringify(params)
    const effectiveCacheKey = cacheKey || `${query}-${paramsKey}`

    const fetchData = useCallback(async (skipCache = false) => {
        if (!enabled) {
            setLoading(false)
            return
        }

        // Check cache first (unless skipping)
        if (!skipCache && cacheDuration > 0) {
            const cached = dataCache.get(effectiveCacheKey)
            if (cached) {
                const age = Date.now() - cached.timestamp
                if (age < cacheDuration) {
                    setData(cached.data as T)
                    setLoading(false)
                    setIsStale(false)
                    return
                } else {
                    // Data is stale but usable
                    setData(cached.data as T)
                    setIsStale(true)
                }
            }
        }

        setLoading(true)
        setError(null)

        // Abort any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        try {
            const result = await client.fetch(query, params)

            // Store in cache
            if (cacheDuration > 0) {
                dataCache.set(effectiveCacheKey, {
                    data: result,
                    timestamp: Date.now()
                })
            }

            setData(result as T)
            setIsStale(false)
            onSuccess?.(result as T)
        } catch (err) {
            // Don't set error if aborted
            if ((err as Error).name !== 'AbortError') {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
                setError(errorMessage)
                onError?.(err as Error)
            }
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, query, paramsKey, effectiveCacheKey, cacheDuration, enabled])

    useEffect(() => {
        fetchData()

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [fetchData])

    const refetch = useCallback(async () => {
        await fetchData(true) // Skip cache
    }, [fetchData])

    return { data, loading, error, refetch, isStale }
}

// useLocalStorage - Persist state to localStorage
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue

        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error)
            return initialValue
        }
    })

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
        }
    }, [key, storedValue])

    return [storedValue, setValue]
}

// useDebounce - Debounce a value
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}

// useInterval - Run callback at intervals
export function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback)

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        if (delay === null) return

        const tick = () => savedCallback.current()
        const id = setInterval(tick, delay)

        return () => clearInterval(id)
    }, [delay])
}

// Helper to clear cache
export function clearWidgetCache(key?: string) {
    if (key) {
        dataCache.delete(key)
    } else {
        dataCache.clear()
    }
}

// Helper to get cache stats
export function getCacheStats() {
    return {
        size: dataCache.size,
        keys: Array.from(dataCache.keys())
    }
}
