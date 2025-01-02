'use client'

import Link from 'next/link';
import UserDropdown from './UserDropdown';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
    const { user } = useAuth();

    return (
        <nav className="border-b bg-background">
            <div className="h-16">
                <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-full items-center justify-between">
                        {/* Left side: Logo and Navigation */}
                        <div className="flex items-center space-x-6">
                            <Link href="/" className="flex items-center">
                                <span className="text-xl font-bold">
                                    Scriptorium
                                </span>
                            </Link>

                            {/* Navigation Links */}
                            <div className="flex items-center space-x-6">
                                <Link href="/editor" className="text-sm font-medium transition-colors hover:text-primary">
                                    Editor
                                </Link>
                                <Link href="/templates" className="text-sm font-medium transition-colors hover:text-primary">
                                    Templates
                                </Link>
                                <Link href="/blog" className="text-sm font-medium transition-colors hover:text-primary">
                                    Blog
                                </Link>
                                {user?.isAdmin && (
                                    <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                                        Admin Panel
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Right side: Theme Toggle and User Menu */}
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <UserDropdown />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}