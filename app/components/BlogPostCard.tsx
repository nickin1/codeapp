import React from 'react';
import { formatDistance } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { BlogPost } from '../types/blog';
import { cn } from "@/lib/utils";

interface BlogPostCardProps {
    post: BlogPost;
    user: any;
    onVote: (postId: string, type: number, e: React.MouseEvent) => void;
    onHide?: (postId: string, type: string, hide: boolean) => void;
    onClick: (post: BlogPost) => void;
}

export default function BlogPostCard({ post, user, onVote, onHide, onClick }: BlogPostCardProps) {
    return (
        <Card
            className={`hover:shadow-lg transition-shadow ${post.hidden ? 'opacity-75' : ''}`}
            onClick={() => onClick(post)}
        >
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                        <Button
                            onClick={(e) => onVote(post.id, 1, e)}
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${user?.id && post.votes.find(vote => vote.userId === user.id)?.type === 1
                                ? 'text-blue-500'
                                : 'text-muted-foreground'}`}
                            disabled={!user}
                        >
                            <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                            {post.votes.reduce((acc, vote) => acc + vote.type, 0)}
                        </span>
                        <Button
                            onClick={(e) => onVote(post.id, -1, e)}
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${user?.id && post.votes.find(vote => vote.userId === user.id)?.type === -1
                                ? 'text-red-500'
                                : 'text-muted-foreground'}`}
                            disabled={!user}
                        >
                            <ThumbsDown className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-xl font-bold hover:text-primary transition-colors duration-200">
                                {post.title}
                            </h2>
                            {post.hidden && (
                                <Badge variant="destructive" className="text-xs">
                                    Hidden
                                </Badge>
                            )}
                        </div>
                        <div className="relative mb-4 h-[4.5rem] overflow-hidden">
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {post.content}
                                </ReactMarkdown>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>
                                By {post.author.firstName} {post.author.lastName}
                            </span>
                            <span>
                                {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
                            </span>
                        </div>
                        {post.tags && post.tags.split(',').filter(tag => tag.trim()).length > 0 && (
                            <div className="flex gap-2 mt-3">
                                {post.tags.split(',').map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                    >
                                        {tag.trim()}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        {user?.isAdmin && onHide && (
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onHide(post.id, 'blogPost', !post.hidden);
                                }}
                                variant={post.hidden ? "default" : "destructive"}
                                size="sm"
                                className="mt-4"
                            >
                                {post.hidden ? 'Unhide' : 'Hide'}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 