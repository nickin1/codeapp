'use client';
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { BlogPost } from '@/app/types/blog';

interface SearchState {
    searchTerm: string;
    filters: {
        tags: string[];
        sortBy: 'dateDesc' | 'dateAsc' | 'scoreDesc' | 'scoreAsc';
    };
    pagination: {
        currentPage: number;
        totalPages: number;
        pageSize: number;
    };
    results: BlogPost[];
    isLoading: boolean;
    error: string | null;
}

const initialState: SearchState = {
    searchTerm: '',
    filters: {
        tags: [],
        sortBy: 'dateDesc'
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 10
    },
    results: [],
    isLoading: false,
    error: null
};

type SearchAction =
    | { type: 'SET_SEARCH_TERM'; payload: string }
    | { type: 'SET_FILTERS'; payload: Partial<SearchState['filters']> }
    | { type: 'SET_RESULTS'; payload: { posts: BlogPost[]; totalPages: number } }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };

const SearchContext = createContext<{
    state: SearchState;
    dispatch: React.Dispatch<SearchAction>;
} | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(searchReducer, initialState);

    return (
        <SearchContext.Provider value={{ state, dispatch }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearchContext() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearchContext must be used within a SearchProvider');
    }
    return context;
}

function searchReducer(state: SearchState, action: SearchAction): SearchState {
    switch (action.type) {
        case 'SET_SEARCH_TERM':
            return {
                ...state,
                searchTerm: action.payload,
                pagination: { ...state.pagination, currentPage: 1 }
            };
        case 'SET_FILTERS':
            return {
                ...state,
                filters: { ...state.filters, ...action.payload },
                pagination: { ...state.pagination, currentPage: 1 }
            };
        case 'SET_RESULTS':
            return {
                ...state,
                results: action.payload.posts,
                pagination: { ...state.pagination, totalPages: action.payload.totalPages }
            };
        case 'SET_PAGE':
            return {
                ...state,
                pagination: { ...state.pagination, currentPage: action.payload }
            };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
} 