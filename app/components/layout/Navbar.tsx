'use client'

import { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import UserDropdown from './UserDropdown';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full">
                        <div className="flex items-center space-x-4">
                            {/* Logo */}
                            <Link href="/" className="flex items-center">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    Scriptorium
                                </span>
                            </Link>

                            {/* Desktop Navigation Links */}
                            <div className="hidden sm:flex sm:items-center sm:space-x-4">
                                <Link href="/editor" className="nav-link">
                                    Editor
                                </Link>
                                <Link href="/templates" className="nav-link">
                                    Templates
                                </Link>
                                <Link href="/blog" className="nav-link">
                                    Blog
                                </Link>
                                {user?.isAdmin && (
                                    <Link href="/admin" className="nav-link">
                                        Admin Panel
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right side items */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-4">
                            <ThemeToggle />
                            <UserDropdown />
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <ThemeToggle />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <span className="sr-only">Open main menu</span>
                                {/* Hamburger icon */}
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {isMobileMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            href="/editor"
                            className="mobile-nav-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Editor
                        </Link>
                        <Link
                            href="/templates"
                            className="mobile-nav-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Templates
                        </Link>
                        <Link
                            href="/blog"
                            className="mobile-nav-link"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Blog
                        </Link>
                        {user?.isAdmin && (
                            <Link
                                href="/admin"
                                className="mobile-nav-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Admin Panel
                            </Link>
                        )}
                        <div className="px-4 py-2">
                            <div className="sm:hidden">
                                <UserDropdown />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}