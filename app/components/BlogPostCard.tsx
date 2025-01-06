import React from 'react';
import { formatDistance } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Eye, EyeOff } from "lucide-react";
import type { BlogPost } from '../types/blog';
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface BlogPostCardProps {
    post: BlogPost;
    user: any;
    onVote: (postId: string, type: number, e: React.MouseEvent) => void;
    onHide?: (postId: string, type: string, hide: boolean) => void;
    onClick: (post: BlogPost) => void;
}

export default function BlogPostCard({ post, user, onVote, onHide, onClick }: BlogPostCardProps) {
    const score = post.votes.reduce((acc, vote) => acc + vote.type, 0);
    const userVote = user ? post.votes.find(vote => vote.userId === user.id)?.type : 0;

    console.log('User Vote:', userVote);
    console.log('Vote array:', post.votes);

    return (
        <Card className="relative overflow-hidden hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.author.image} alt={post.author.name} />
                            <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h3 className="font-semibold leading-none">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                by {post.author.name} • {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {user?.isAdmin && (
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (onHide) {
                                        onHide(post.id, 'blogPost', !post.hidden);
                                    }
                                }}
                                variant={post.hidden ? "outline" : "destructive"}
                                size="sm"
                                className="relative z-10"
                            >
                                {post.hidden ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <EyeOff className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                        {post.hidden && (
                            <Badge variant="destructive" className="text-xs">Hidden</Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <div className="relative mb-4 h-[4.5rem] overflow-hidden">
                    <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content}
                        </ReactMarkdown>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
                </div>

                {post.tags && (
                    <div className="flex flex-wrap gap-1.5">
                        {post.tags.split(',').map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag.trim()}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onVote(post.id, 1, e);
                        }}
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-8 w-8 p-0 relative z-10",
                            userVote === 1 && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-500"
                        )}
                        disabled={!user}
                    >
                        <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[2ch] text-center relative z-10">{score}</span>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onVote(post.id, -1, e);
                        }}
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-8 w-8 p-0 relative z-10",
                            userVote === -1 && "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                        )}
                        disabled={!user}
                    >
                        <ThumbsDown className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    onClick(post);
                }}
                className="absolute inset-0 w-full h-full opacity-0 z-[1]"
                aria-label="View post"
            />
        </Card>
    );
} 