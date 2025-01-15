'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { useDebounce } from '@/app/hooks/useDebounce';
import SearchBar from '@/app/components/SearchBar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import 'flag-icons/css/flag-icons.min.css'

interface ExecutionLog {
    id: string;
    code: string;
    language: string;
    ipAddress: string;
    country: string;
    userId: string | null;
    user: {
        name: string | null;
        email: string | null;
        image: string | null;
    } | null;
    createdAt: string;
    memoryUsage: number | null;
    cpuUsage: number | null;
    execTime: number | null;
}

interface PaginationInfo {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

export default function ExecutionLogs() {
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [showClearDialog, setShowClearDialog] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [debouncedSearchTerm, currentPage]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                searchTerm: debouncedSearchTerm,
                page: currentPage.toString(),
                limit: '20',
            });

            const response = await fetch(`/api/admin/execution-logs?${params}`);
            if (!response.ok) throw new Error('Failed to fetch logs');

            const data = await response.json();
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCountryFlag = (countryCode: string) => {
        if (!countryCode || countryCode === 'Unknown' || countryCode === 'unknown') {
            return '🌐';
        }

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    const handleClearLogs = async () => {
        try {
            const response = await fetch('/api/admin/execution-logs', {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to clear logs');

            setLogs([]);
            setPagination(null);
            setShowClearDialog(false);
        } catch (error) {
            console.error('Error clearing logs:', error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>;
    }

    return (
        <TooltipProvider delayDuration={100}>
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="w-72">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search logs..."
                        />
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowClearDialog(true)}
                        className="gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear All Logs
                    </Button>
                </div>

                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent h-7">
                                <TableHead className="w-[150px] py-1 text-xs">User</TableHead>
                                <TableHead className="py-1 text-xs">IP Address</TableHead>
                                <TableHead className="py-1 text-xs w-[50px]">Location</TableHead>
                                <TableHead className="py-1 text-xs">Language</TableHead>
                                <TableHead className="py-1 text-xs w-[120px]">Date</TableHead>
                                <TableHead className="py-1 text-xs">Code Preview</TableHead>
                                <TableHead className="py-1 text-xs w-[80px]">Memory</TableHead>
                                <TableHead className="py-1 text-xs w-[60px]">CPU</TableHead>
                                <TableHead className="py-1 text-xs w-[60px]">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id} className="h-6 hover:bg-muted/30">
                                    <TableCell className="py-1">
                                        {log.user ? (
                                            <div className="flex items-center gap-1.5">
                                                <Avatar className="h-4 w-4">
                                                    <AvatarImage src={log.user.image || undefined} />
                                                    <AvatarFallback className="text-[10px]">{log.user.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs">{log.user.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Anonymous</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <span className="text-xs">{log.ipAddress}</span>
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="inline-flex cursor-default">
                                                    {log.country && log.country !== 'Unknown' ? (
                                                        <span className={`fi fi-${log.country.toLowerCase()}`} />
                                                    ) : (
                                                        <span>🌐</span>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p className="text-xs">{log.country === 'Unknown' ? 'Location unknown' : log.country}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <span className="text-xs">{log.language}</span>
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <span className="text-xs">{format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}</span>
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <code className="text-[10px] text-muted-foreground truncate max-w-[300px] block">
                                            {log.code}
                                        </code>
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <span className="text-xs">
                                            {log.memoryUsage ? `${log.memoryUsage.toFixed(1)}MB` : '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <span className="text-xs">
                                            {log.cpuUsage ? `${log.cpuUsage.toFixed(1)}%` : '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-1">
                                        <span className="text-xs">
                                            {log.execTime ? `${log.execTime.toFixed(2)}s` : '-'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                            disabled={currentPage === pagination.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear All Logs</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to clear all execution logs? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearLogs} className="bg-destructive text-destructive-foreground">
                            Clear All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    );
} 