import { useState, useEffect, useCallback } from 'react';

interface UseFavoritesReturn {
    favorites: Set<string>;
    isShowingFavorites: boolean;
    toggleFavorite: (id: string) => void;
    setIsShowingFavorites: (value: boolean) => void;
    setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useFavorites(storageKey = 'wbjeePredictorFavorites'): UseFavoritesReturn {
    // Lazy initialization - load from localStorage once on mount
    const [favorites, setFavorites] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return new Set(parsed);
            }
        } catch (error) {
            console.warn('Failed to load favorites:', error);
        }
        return new Set();
    });
    const [isShowingFavorites, setIsShowingFavorites] = useState(false);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            try {
                localStorage.setItem(storageKey, JSON.stringify(Array.from(favorites)));
            } catch (error) {
                console.warn('Failed to save favorites:', error);
            }
        }, 1000); // Debounce saves

        return () => clearTimeout(timeoutId);
    }, [favorites, storageKey]);

    const toggleFavorite = useCallback((id: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            return newFavorites;
        });
    }, []);

    return {
        favorites,
        isShowingFavorites,
        toggleFavorite,
        setIsShowingFavorites,
        setFavorites,
    };
}
