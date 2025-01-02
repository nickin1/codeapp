'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserDropdown() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Don't render anything during the initial load
    if (isLoading) {
        return (
            <div className="w-[68px] h-9" /> // Placeholder with same width as login button
        );
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link href="/login">
                    <Button variant="ghost" className="cursor-pointer">Log in</Button>
                </Link>
                <Link href="/signup">
                    <Button className="cursor-pointer">Sign up</Button>
                </Link>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-auto cursor-pointer">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || '/placeholder-avatar.png'} alt={`${user.firstName}'s avatar`} />
                        <AvatarFallback>{user.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">
                        {user.firstName} {user.lastName}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer" onClick={handleLogout}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
} 