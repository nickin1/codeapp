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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
            name: string;
            image?: string;
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
    console.log('Forked status:', template.forked);
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
        <Card className="h-[240px] flex flex-col">
            <CardContent className="pt-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                    <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-lg font-semibold truncate">
                                {template.title}
                            </h3>
                            {template.forked === true && (
                                <Badge
                                    variant="outline"
                                    className="flex-shrink-0 bg-orange-50 dark:bg-orange-900/50 text-orange-600 dark:text-orange-200 border-orange-200 dark:border-orange-800 font-medium"
                                >
                                    Forked
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-200 border-purple-200 dark:border-purple-800 font-medium"
                            >
                                {template.language}
                            </Badge>
                        </div>
                    </div>
                </div>

                {template.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {template.description}
                    </p>
                )}

                <div className="flex gap-2 mt-auto pt-2 overflow-hidden whitespace-nowrap">
                    {template.tags.split(',').slice(0, 3).map((tag: string, index: number) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-200"
                        >
                            {tag.trim()}
                        </Badge>
                    ))}
                    {template.tags.split(',').length > 3 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-200 cursor-default"
                                    >
                                        +{template.tags.split(',').length - 3}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent
                                    className="max-w-[300px] bg-background border"
                                    side="top"
                                >
                                    <div className="flex flex-wrap gap-1">
                                        {template.tags.split(',')
                                            .slice(3)
                                            .map((tag: string, index: number) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-200"
                                                >
                                                    {tag.trim()}
                                                </Badge>
                                            ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </CardContent>

            <CardFooter className="border-t py-2 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={template.author?.image} alt={template.author?.name || 'Unknown'} />
                        <AvatarFallback>
                            {template.author?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                        {template.author
                            ? template.author.name
                            : 'Unknown Author'
                        }
                    </span>
                    {isOwner && (
                        <Badge
                            variant="outline"
                            className="bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-200 border-green-200 dark:border-green-800 font-medium"
                        >
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