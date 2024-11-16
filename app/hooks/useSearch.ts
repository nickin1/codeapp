import { useState, useEffect } from 'react';
import { useDebounce } from '@/app/hooks/useDebounce';

interface SearchResult {
    id: string;
    type: 'template' | 'blog' | 'user';
    title: string;
    description?: string;
    url: string;
}

export function useSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    return { query, setQuery, results, isLoading };
} 