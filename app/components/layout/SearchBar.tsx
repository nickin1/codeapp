'use client';

import { useRef, useState } from 'react';
import { useSearch } from '@/app/hooks/useSearch';
import { useOnClickOutside } from '@/app/hooks/useOnClickOutside';
import Link from 'next/link';

export default function SearchBar() {
    const [isFocused, setIsFocused] = useState(false);
    const { query, setQuery, results, isLoading } = useSearch();
    const searchRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(searchRef, () => setIsFocused(false));

    return (
        <div ref={searchRef} className="relative w-full max-w-xs">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Search templates, blogs..."
                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-md
                     bg-gray-50 dark:bg-gray-700
                     border-gray-300 dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isFocused && query && (
                <div className="fixed mt-2 w-[inherit] bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    style={{
                        width: searchRef.current?.clientWidth,
                        top: (searchRef.current?.getBoundingClientRect().bottom || 0) + 8,
                        left: searchRef.current?.getBoundingClientRect().left,
                    }}
                >
                    {isLoading ? (
                        <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 min-h-[100px] flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2 max-h-96 overflow-auto">
                            {results.map((result) => (
                                <Link
                                    key={result.id}
                                    href={result.url}
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => setIsFocused(false)}
                                >
                                    <div className="flex items-center">
                                        <span className="ml-2">
                                            <div className="font-medium">{result.title}</div>
                                            {result.description && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {result.description}
                                                </div>
                                            )}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 min-h-[100px] flex items-center justify-center">
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 