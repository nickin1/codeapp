'use client'

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import UserDropdown from './UserDropdown';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/app/context/AuthContext';
import { Github, Code2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from 'react';

export default function Navbar() {
    const { user, login } = useAuth();
    const searchParams = useSearchParams();
    const showActivationDialog = searchParams?.get('show') === 'activation-pending';
    const [isOpen, setIsOpen] = useState(false);

    const NavLinks = () => (
        <>
            <Link
                href="/editor"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
            >
                Editor
            </Link>
            <Link
                href="/templates"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
            >
                Templates
            </Link>
            <Link
                href="/blog"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
            >
                Blog
            </Link>
            {user?.isAdmin && (
                <Link
                    href="/admin"
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                >
                    Admin Panel
                </Link>
            )}
        </>
    );

    return (
        <>
            <nav className="border-b bg-background fixed top-0 left-0 right-0 z-[9999]">
                <div className="h-16">
                    <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-full items-center justify-between">
                            {/* Left side: Logo and Navigation */}
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <Code2 className="h-6 w-6" />
                                </Link>

                                {/* Desktop Navigation Links */}
                                <div className="hidden md:flex items-center space-x-6 ml-6">
                                    <NavLinks />
                                </div>
                            </div>

                            {/* Right side: Theme toggle, auth, and mobile menu */}
                            <div className="flex items-center space-x-4">
                                <ThemeToggle />
                                {user ? (
                                    <UserDropdown />
                                ) : (
                                    <Button
                                        onClick={() => login()}
                                        variant="outline"
                                        size="sm"
                                        className="hidden md:flex gap-2"
                                    >
                                        <Github className="h-4 w-4" />
                                        Continue with GitHub
                                    </Button>
                                )}

                                {/* Mobile Menu Button */}
                                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="md:hidden">
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-[250px]">
                                        <SheetHeader>
                                            <SheetTitle>Navigation Menu</SheetTitle>
                                        </SheetHeader>
                                        <div className="flex flex-col space-y-4 mt-6">
                                            <NavLinks />
                                            {!user && (
                                                <Button
                                                    onClick={() => {
                                                        login();
                                                        setIsOpen(false);
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2"
                                                >
                                                    <Github className="h-4 w-4" />
                                                    Continue with GitHub
                                                </Button>
                                            )}
                                        </div>
                                    </SheetContent>
                                </Sheet>
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