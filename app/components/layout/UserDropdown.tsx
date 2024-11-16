'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/Button';
import { useAuth } from '@/app/context/AuthContext';

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="flex space-x-2">
                <Link href="/login">
                    <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/signup">
                    <Button variant="primary">Sign up</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatar || '/placeholder-avatar.png'}
                    alt={`${user.firstName}'s avatar`}
                />
                <span className="hidden md:block">
                    {user.firstName} {user.lastName}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        <Link href="/profile" className="dropdown-item">
                            Profile
                        </Link>
                        <Link href="/templates" className="dropdown-item">
                            My Templates
                        </Link>
                        <Link href="/blog/my-posts" className="dropdown-item">
                            My Posts
                        </Link>
                        <button onClick={logout} className="dropdown-item text-red-600">
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 