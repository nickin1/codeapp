import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import BlogPostsPopup from './BlogPostsPopup';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpRight, Link2, BookOpen, Trash2 } from "lucide-react";
import {
    Popover,
    PopoverTrigger,
} from "@/components/ui/popover";

interface TemplateCardProps {
    template: {
        id: string;
        title: string;
        description?: string;
        code: string;
        language: string;
        tags: string;
        authorId: string;
        author?: {
            firstName: string;
            lastName: string;
        };
        forked: boolean;
        createdAt: Date;
        updatedAt: Date;
        blogPosts: Array<{
            id: string;
            title: string;
        }>;
    };
    onDelete?: (id: string) => void;
    onUpdate?: () => void;
}

export default function TemplateCard({ template, onDelete, onUpdate }: TemplateCardProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [showBlogPosts, setShowBlogPosts] = useState(false);
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);

    const handleViewInEditor = () => {
        router.push(`/editor?templateId=${template.id}`);
    };

    const isOwner = user?.id === template.authorId;

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = `${window.location.origin}/editor?templateId=${template.id}`;
        navigator.clipboard.writeText(link);
        setCopyFeedback(true);
        setShowCopyTooltip(true);

        setTimeout(() => {
            setShowCopyTooltip(false);
            setTimeout(() => {
                setCopyFeedback(false);
            }, 150);
        }, 1000);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(template.id);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">
                        {template.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        {template.forked && (
                            <Badge variant="secondary">
                                Forked
                            </Badge>
                        )}
                    </div>
                </div>
                {template.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                        {template.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-2 mt-auto pt-3">
                    <Badge variant="default" className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200">
                        {template.language}
                    </Badge>
                    {template.tags.split(',').map((tag: string, index: number) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-200"
                        >
                            {tag.trim()}
                        </Badge>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="border-t py-2 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                    <span className="truncate">
                        by {template.author
                            ? `${template.author.firstName} ${template.author.lastName}`
                            : 'Unknown Author'
                        }
                    </span>
                    {isOwner && (
                        <Badge variant="secondary" className="flex-shrink-0 bg-green-500">
                            You
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {template.blogPosts.length > 0 && (
                        <Popover open={showBlogPosts} onOpenChange={setShowBlogPosts}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                                            >
                                                <BookOpen className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {template.blogPosts.length} Blog Post{template.blogPosts.length !== 1 ? 's' : ''}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <BlogPostsPopup
                                blogPosts={template.blogPosts}
                                isVisible={showBlogPosts}
                            />
                        </Popover>
                    )}

                    <TooltipProvider>
                        <Tooltip open={showCopyTooltip}>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleCopyLink}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                >
                                    <Link2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {copyFeedback ? 'Copied!' : 'Copy template link'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleViewInEditor}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                View in Code Editor
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {isOwner && (
                        <Button
                            onClick={handleDeleteClick}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}