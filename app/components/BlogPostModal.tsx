'use client';

import React, { useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import CommentSection from './CommentSection';
import { useAuth } from '../context/AuthContext';
import type { BlogPost } from '../types/blog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import 'prismjs/themes/prism-tomorrow.css';
import BlogForm from './BlogForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ThumbsUp, ThumbsDown, MessageSquare, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface BlogPostModalProps {
    post: BlogPost;
    onClose: () => void;
    onUpdate: () => void;
}

export default function BlogPostModal({ post: initialPost, onClose, onUpdate }: BlogPostModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState(initialPost);
    const [votes, setVotes] = useState(initialPost.votes);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    // Pre-load comments
    useEffect(() => {
        // Small delay to ensure smooth modal opening
        const timer = setTimeout(() => {
            setCommentsLoaded(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 300);
    };

    const handleVote = async (type: number) => {
        if (!user) return;

        try {
            const response = await fetch(`/api/blogs/${currentPost.id}/vote`, {
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

                if (data.message === "Vote removed") {
                    setVotes(currentVotes =>
                        currentVotes.filter(vote => vote.userId !== user.id)
                    );
                } else {
                    setVotes(currentVotes => {
                        const newVotes = currentVotes.filter(vote => vote.userId !== user.id);
                        return [...newVotes, data];
                    });
                }

                onUpdate();
            }
        } catch (error) {
            console.error('Error voting on post:', error);
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

            // Update the local state
            setCurrentPost(prev => ({
                ...prev,
                hidden: hide
            }));

            // Call the parent's update function
            onUpdate();
        } catch (error) {
            console.error('Error updating content visibility:', error);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/blogs/${currentPost.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            if (response.ok) {
                toast({
                    title: "Post deleted",
                    description: "The post has been successfully deleted.",
                });
                onClose();
                onUpdate();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete the post.",
                variant: "destructive",
            });
            console.error('Error deleting post:', error);
        }
    };

    const score = votes.reduce((acc, vote) => acc + vote.type, 0);
    const userVote = user ? votes.find(vote => vote.userId === user.id)?.type : 0;

    if (isEditing) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-6xl">
                    <BlogForm
                        post={currentPost}
                        open={isEditing}
                        onClose={() => setIsEditing(false)}
                        onSubmit={(updatedPost) => {
                            setCurrentPost(updatedPost);
                            setIsEditing(false);
                            onUpdate();
                        }}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <DialogTitle className="text-xl">{currentPost.title}</DialogTitle>
                            {currentPost.hidden && (
                                <Badge variant="destructive" className="text-xs">Hidden</Badge>
                            )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full overflow-hidden">
                                    {currentPost.author.image ? (
                                        <img
                                            src={currentPost.author.image}
                                            alt={currentPost.author.name || ''}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-primary/10 flex items-center justify-center text-xs font-medium uppercase">
                                            {currentPost.author.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <span>
                                    Posted by {currentPost.author.name} •{' '}
                                    {formatDistance(new Date(currentPost.createdAt), new Date(), { addSuffix: true })}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {user?.id === currentPost.authorId && (
                                    <>
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 gap-1.5"
                                            disabled={currentPost.hidden}
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => setShowDeleteAlert(true)}
                                            variant="destructive"
                                            size="sm"
                                            className="h-7 gap-1.5"
                                            disabled={currentPost.hidden}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </Button>
                                    </>
                                )}
                                {user?.isAdmin && (
                                    <Button
                                        onClick={() => handleHideContent(currentPost.id, 'blogPost', !currentPost.hidden)}
                                        variant={currentPost.hidden ? "default" : "destructive"}
                                        size="sm"
                                        className="h-7 gap-1.5"
                                    >
                                        {currentPost.hidden ? (
                                            <>
                                                <Eye className="h-3.5 w-3.5" />
                                                Unhide
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="h-3.5 w-3.5" />
                                                Hide
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex gap-3 mt-3">
                        {/* Voting */}
                        <div className="flex flex-col items-center gap-0.5">
                            <Button
                                onClick={() => handleVote(1)}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 w-7 p-0",
                                    userVote === 1 && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-500"
                                )}
                                disabled={!user}
                            >
                                <ThumbsUp className="h-3.5 w-3.5" />
                            </Button>
                            <span className="text-sm font-medium">{score}</span>
                            <Button
                                onClick={() => handleVote(-1)}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 w-7 p-0",
                                    userVote === -1 && "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                )}
                                disabled={!user}
                            >
                                <ThumbsDown className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="prose dark:prose-invert max-w-none mb-4">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw, [rehypePrism, { showLineNumbers: true }]]}
                                    className="markdown-content"
                                >
                                    {currentPost.content}
                                </ReactMarkdown>
                            </div>

                            {/* Tags */}
                            {currentPost.tags && currentPost.tags.split(',').filter(tag => tag.trim()).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {currentPost.tags.split(',').map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {tag.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Templates */}
                            {(currentPost.templates?.length ?? 0) > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium mb-1.5">Related Templates:</h3>
                                    <div className="flex gap-2">
                                        {currentPost.templates?.map((template) => (
                                            <Button
                                                key={template.id}
                                                variant="link"
                                                className="h-auto p-0 text-sm"
                                                asChild
                                            >
                                                <a
                                                    href={`/templates/${template.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {template.title}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments section - moved outside the flex container */}
                    <div className="border-t pt-3 mt-4">
                        <Button
                            onClick={() => setShowComments(!showComments)}
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-sm"
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {showComments ? 'Hide Comments' : 'Show Comments'}
                        </Button>

                        <AnimatePresence initial={false}>
                            {showComments && commentsLoaded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{
                                        opacity: 1,
                                        height: "auto",
                                        transition: {
                                            height: { duration: 0.3 },
                                            opacity: { duration: 0.3, delay: 0.1 }
                                        }
                                    }}
                                    exit={{
                                        opacity: 0,
                                        height: 0,
                                        transition: {
                                            height: { duration: 0.3 },
                                            opacity: { duration: 0.2 }
                                        }
                                    }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3">
                                        <CommentSection
                                            postId={currentPost.id}
                                            onUpdate={onUpdate}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your post.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 
