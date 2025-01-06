'use client';
import { useEffect } from 'react';
import { useSearchContext } from '@/app/context/SearchContext';
import { useDebounce } from '@/app/hooks/useDebounce';

export function useSearch() {
    const { state, dispatch } = useSearchContext();
    const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

    useEffect(() => {
        const fetchResults = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const params = new URLSearchParams({
                    searchTerm: debouncedSearchTerm,
                    page: state.pagination.currentPage.toString(),
                    limit: state.pagination.pageSize.toString(),
                    sortBy: state.filters.sortBy,
                    ...(state.filters.tags.length > 0 && { tags: state.filters.tags.join(',') })
                });

                const response = await fetch(`/api/blogs/search?${params}`);
                if (!response.ok) throw new Error('Failed to fetch results');

                const data = await response.json();
                dispatch({
                    type: 'SET_RESULTS',
                    payload: {
                        posts: data.posts,
                        totalPages: data.totalPages
                    }
                });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch results' });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        fetchResults();
    }, [debouncedSearchTerm, state.pagination.currentPage, state.filters]);

    return {
        searchTerm: state.searchTerm,
        results: state.results,
        isLoading: state.isLoading,
        error: state.error,
        pagination: state.pagination,
        filters: state.filters,
        setSearchTerm: (term: string) => dispatch({ type: 'SET_SEARCH_TERM', payload: term }),
        setFilters: (filters: Partial<typeof state.filters>) =>
            dispatch({ type: 'SET_FILTERS', payload: filters }),
        setPage: (page: number) => dispatch({ type: 'SET_PAGE', payload: page })
    };
} 