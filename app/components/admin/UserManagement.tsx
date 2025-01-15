'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { format } from 'date-fns';
import SearchBar from '@/app/components/SearchBar';
import { useDebounce } from '@/app/hooks/useDebounce';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    github_url: string | null;
    isActivated: boolean;
    isAdmin: boolean;
    createdAt: string;
    last_login: string | null;
    _count: {
        blogPosts: number;
        comments: number;
        templates: number;
    };
}

interface PaginationInfo {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        fetchUsers();
    }, [debouncedSearchTerm, currentPage, sortBy]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                searchTerm: debouncedSearchTerm,
                page: currentPage.toString(),
                limit: '10',
                sortBy,
            });

            const response = await fetch(`/api/admin/users?${params}`);
            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserUpdate = async (userId: string, field: 'isActivated', value: boolean) => {
        // Optimistically update the UI
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === userId
                    ? { ...user, [field]: value }
                    : user
            )
        );

        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    [field]: value,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                // Revert the change if the server request failed
                setUsers(currentUsers =>
                    currentUsers.map(user =>
                        user.id === userId
                            ? { ...user, [field]: !value }
                            : user
                    )
                );
                throw new Error(error.error || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-card">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>;
    }

    if (!user?.isAdmin) {
        return <div className="min-h-screen bg-card" />;
    }

    return (
        <div className="min-h-screen bg-card">
            <div className="container mx-auto py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        User Management
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-72">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search users..."
                        />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">Join Date</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-muted/50">
                                <TableHead className="text-muted-foreground w-[300px]">User</TableHead>
                                <TableHead className="text-muted-foreground w-[100px]">GitHub</TableHead>
                                <TableHead className="text-muted-foreground w-[100px]">Role</TableHead>
                                <TableHead className="text-muted-foreground w-[100px]">Activity</TableHead>
                                <TableHead className="text-muted-foreground w-[180px]">Joined</TableHead>
                                <TableHead className="text-muted-foreground w-[180px]">Last Login</TableHead>
                                <TableHead className="text-muted-foreground w-[150px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.image || undefined} />
                                                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.github_url ? (
                                            <a
                                                href={user.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Profile →
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">Not linked</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={cn(
                                                user.isAdmin
                                                    ? "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
                                                    : "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                                            )}
                                        >
                                            {user.isAdmin ? 'Admin' : 'User'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">
                                            {user._count.blogPosts + user._count.comments + user._count.templates} items
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(user.createdAt), 'MMM d, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        {user.last_login ? (
                                            format(new Date(user.last_login), 'MMM d, yyyy HH:mm')
                                        ) : (
                                            <span className="text-muted-foreground text-sm">Never</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="w-[150px]">
                                        <div className="flex items-center gap-2 min-w-[120px]">
                                            <Switch
                                                checked={user.isActivated}
                                                onCheckedChange={(checked) =>
                                                    handleUserUpdate(user.id, 'isActivated', checked)
                                                }
                                                disabled={user.isAdmin}
                                                className={user.isActivated ?
                                                    "data-[state=checked]:bg-green-500 data-[state=checked]:dark:bg-green-600" :
                                                    "data-[state=unchecked]:bg-red-500 dark:data-[state=unchecked]:bg-red-600"
                                                }
                                            />
                                            <span className={cn(
                                                "text-sm min-w-[60px]",
                                                user.isActivated ?
                                                    "text-green-600 dark:text-green-400" :
                                                    "text-red-600 dark:text-red-400"
                                            )}>
                                                {user.isActivated ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                            disabled={currentPage === pagination.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
} 