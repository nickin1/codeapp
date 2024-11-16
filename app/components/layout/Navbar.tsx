'use client'

import { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import UserDropdown from './UserDropdown';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Scriptorium
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/editor" className="nav-link">
                                Editor
                            </Link>
                            <Link href="/templates" className="nav-link">
                                Templates
                            </Link>
                            <Link href="/blog" className="nav-link">
                                Blog
                            </Link>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-4">
                        <SearchBar />
                        <ThemeToggle />
                        <UserDropdown />
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Hamburger icon */}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/editor" className="mobile-nav-link">
                            Editor
                        </Link>
                        <Link href="/templates" className="mobile-nav-link">
                            Templates
                        </Link>
                        <Link href="/blog" className="mobile-nav-link">
                            Blog
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}