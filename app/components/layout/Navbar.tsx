'use client'

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import UserDropdown from './UserDropdown';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/app/context/AuthContext';
import { Github, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function Navbar() {
    const { user, login } = useAuth();
    const searchParams = useSearchParams();
    const showActivationDialog = searchParams?.get('show') === 'activation-pending';

    return (
        <>
            <nav className="border-b bg-background fixed top-0 left-0 right-0 z-[9999]">
                <div className="h-16">
                    <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-full items-center justify-between">
                            {/* Left side: Logo and Navigation */}
                            <div className="flex items-center space-x-6">
                                <Link href="/" className="flex items-center">
                                    <Code2 className="h-6 w-6" />
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

                            {/* Right side: Theme toggle and auth */}
                            <div className="flex items-center space-x-4">
                                <ThemeToggle />
                                {user ? (
                                    <UserDropdown />
                                ) : (
                                    <Button
                                        onClick={() => login()}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Github className="h-4 w-4" />
                                        Continue with GitHub
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <Dialog open={showActivationDialog} onOpenChange={() => window.history.pushState({}, '', '/')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Account Pending Activation</DialogTitle>
                        <DialogDescription>
                            Thank you for signing up! Your account is currently pending activation.
                            Please wait for an administrator to activate your account before trying again.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}