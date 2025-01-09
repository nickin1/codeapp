'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDistance } from 'date-fns';
import type { Comment } from '../types/blog';
import ReportModal from './ReportModal';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Reply, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
} from "@/components/ui/collapsible"
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CommentSectionProps {
    postId: string;
    onUpdate: () => void;
}

export default function CommentSection({ postId, onUpdate }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [reportingComment, setReportingComment] = useState<string | null>(null);
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchComments = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`/api/blogs/${postId}`, {
                headers: accessToken ? {
                    'Authorization': `Bearer ${accessToken}`,
                } : {}
            });

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data = await response.json();
            setComments(data.comments || []);
            setError(null);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Failed to load comments');
            setComments([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmitComment = async (e: React.FormEvent, parentId?: string) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            if (!user) return;

            const text = parentId ? replyText : commentText;
            if (!text.trim()) return;

            const response = await fetch(`/api/blogs/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    content: text,
                    authorId: user.id,
                    blogPostId: postId,
                    parentId,
                }),
            });

            if (response.ok) {
                if (parentId) {
                    setReplyText('');
                    setReplyTo(null);
                } else {
                    setCommentText('');
                }
                fetchComments();
                onUpdate();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateCommentVotes = (comments: Comment[], commentId: string, data: any): Comment[] => {
        return comments.map(comment => {
            if (comment.id === commentId) {
                if (data.message === "Vote removed") {
                    return {
                        ...comment,
                        votes: comment.votes.filter(vote => vote.userId !== user?.id)
                    };
                }
                const newVotes = comment.votes.filter(vote => vote.userId !== user?.id);
                return {
                    ...comment,
                    votes: [...newVotes, data]
                };
            }

            if (comment.children && comment.children.length > 0) {
                return {
                    ...comment,
                    children: updateCommentVotes(comment.children, commentId, data)
                };
            }

            return comment;
        });
    };

    const handleVote = async (commentId: string, type: number) => {
        if (!user) return;

        try {
            const response = await fetch(`/api/blogs/${postId}/comments/${commentId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    type,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                setComments(currentComments => updateCommentVotes(currentComments, commentId, data));
            }
        } catch (error) {
            console.error('Error voting on comment:', error);
        }
    };

    const handleHideContent = async (contentId: string, contentType: string, hide: boolean) => {
        try {
            const response = await fetch('/api/admin/hide-content', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentId, contentType, hide }),
            });

            if (!response.ok) {
                throw new Error('Failed to update content visibility');
            }

            setComments(currentComments =>
                currentComments.map(comment => {
                    if (comment.id === contentId) {
                        return { ...comment, hidden: hide };
                    }
                    if (comment.children && comment.children.length > 0) {
                        return {
                            ...comment,
                            children: updateCommentsRecursively(comment.children, contentId, hide)
                        };
                    }
                    return comment;
                })
            );
        } catch (error) {
            console.error('Error updating content visibility:', error);
        }
    };

    const updateCommentsRecursively = (comments: Comment[], contentId: string, hide: boolean): Comment[] => {
        return comments.map(comment => {
            if (comment.id === contentId) {
                return { ...comment, hidden: hide };
            }
            if (comment.children && comment.children.length > 0) {
                return {
                    ...comment,
                    children: updateCommentsRecursively(comment.children, contentId, hide)
                };
            }
            return comment;
        });
    };

    const renderComment = (comment: Comment) => {
        const score = comment.votes.reduce((acc, vote) => acc + vote.type, 0);
        const userVote = user ? comment.votes.find(vote => vote.userId === user.id)?.type : 0;
        const isReplyingToThis = replyTo === comment.id;

        return (
            <div key={comment.id} className={cn(
                "border-l-2 pl-4 space-y-2",
                comment.hidden ? "opacity-60" : "",
                "border-l-muted"
            )}>
                <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.author.image || undefined} />
                        <AvatarFallback>{comment.author.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                        {comment.author.name}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                        {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                    </span>
                    {comment.hidden && (
                        <span className="text-destructive text-xs">[Hidden]</span>
                    )}
                </div>

                <p className="text-sm">{comment.content}</p>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Button
                            onClick={() => handleVote(comment.id, 1)}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-6 w-6 p-0",
                                userVote === 1 && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-500"
                            )}
                            disabled={!user}
                        >
                            <ThumbsUp className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-sm font-medium min-w-[20px] text-center">{score}</span>
                        <Button
                            onClick={() => handleVote(comment.id, -1)}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-6 w-6 p-0",
                                userVote === -1 && "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                            )}
                            disabled={!user}
                        >
                            <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {user && (
                        <Button
                            onClick={() => setReplyTo(isReplyingToThis ? null : comment.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                        >
                            <Reply className="h-3 w-3 mr-1" />
                            {isReplyingToThis ? 'Cancel' : 'Reply'}
                        </Button>
                    )}

                    {user && (
                        <Button
                            onClick={() => setReportingComment(`${postId}-${comment.id}`)}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-destructive"
                        >
                            <Flag className="h-3 w-3 mr-1" />
                            Report
                        </Button>
                    )}
                </div>

                <AnimatePresence>
                    {isReplyingToThis && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{
                                opacity: 1,
                                height: "auto",
                                transition: {
                                    height: { duration: 0.2 },
                                    opacity: { duration: 0.2, delay: 0.1 }
                                }
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                                transition: {
                                    height: { duration: 0.2 },
                                    opacity: { duration: 0.15 }
                                }
                            }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 p-0.5">
                                <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className="space-y-2">
                                    <Textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="resize-none text-sm min-h-[60px]"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="h-8"
                                            disabled={!replyText.trim()}
                                        >
                                            Reply
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {comment.children && comment.children.length > 0 && (
                    <div className="mt-2 space-y-4">
                        {comment.children.map(childComment => renderComment(childComment))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive" className="py-2">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {user && (
                <div className="flex-1 p-0.5">
                    <form onSubmit={handleSubmitComment} className="space-y-2">
                        <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="resize-none text-sm min-h-[80px]"
                        />
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                size="sm"
                                className="h-8 px-4"
                                disabled={!commentText.trim() || isSubmitting}
                            >
                                Comment
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : comments && comments.length > 0 ? (
                    comments
                        .filter(comment => !comment.parentId)
                        .map(comment => renderComment(comment))
                ) : (
                    <p className="text-muted-foreground text-center py-2 text-sm">
                        No comments yet
                    </p>
                )}
            </div>

            {reportingComment && (
                <ReportModal
                    contentId={reportingComment}
                    contentType="comment"
                    onClose={() => setReportingComment(null)}
                    onSubmit={onUpdate}
                    open={!!reportingComment}
                />
            )}
        </div>
    );
}