'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDistance } from 'date-fns';
import type { Comment } from '../types/blog';

interface CommentSectionProps {
    postId: string;
    onUpdate: () => void;
}

export default function CommentSection({ postId, onUpdate }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/blogs/${postId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }
            const data = await response.json();
            setComments(data.comments || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Failed to load comments');
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        try {
            const response = await fetch(`/api/blogs/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    content: newComment,
                    authorId: user.id,
                    blogPostId: postId,
                    parentId: replyTo,
                }),
            });

            if (response.ok) {
                setNewComment('');
                setReplyTo(null);
                fetchComments();
                onUpdate();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const updateCommentVotes = (comments: Comment[], commentId: string, data: any): Comment[] => {
        return comments.map(comment => {
            // Check if this is the comment we want to update
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

            // If this comment has children, recursively update them
            if (comment.children && comment.children.length > 0) {
                return {
                    ...comment,
                    children: updateCommentVotes(comment.children, commentId, data)
                };
            }

            // If no match and no children, return unchanged
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

                // Update comments using the recursive function
                setComments(currentComments => updateCommentVotes(currentComments, commentId, data));
            }
        } catch (error) {
            console.error('Error voting on comment:', error);
        }
    };

    const renderComment = (comment: Comment) => {
        const score = comment.votes.reduce((acc, vote) => acc + vote.type, 0);
        const userVote = user ? comment.votes.find(vote => vote.userId === user.id)?.type : 0;

        return (
            <div key={comment.id} className="border-l-2 pl-4 mb-4">
                <div className="flex items-start gap-2">
                    {/* Voting buttons */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => handleVote(comment.id, 1)}
                            className={`p-1 ${userVote === 1 ? 'text-blue-500' : 'text-gray-400'}`}
                            disabled={!user}
                        >
                            ▲
                        </button>
                        <span className="text-sm font-medium">{score}</span>
                        <button
                            onClick={() => handleVote(comment.id, -1)}
                            className={`p-1 ${userVote === -1 ? 'text-red-500' : 'text-gray-400'}`}
                            disabled={!user}
                        >
                            ▼
                        </button>
                    </div>

                    {/* Rest of comment content */}
                    <div className="flex-1">
                        <div className="text-sm text-gray-500">
                            {comment.author.firstName} {comment.author.lastName} •
                            {formatDistance(new Date(comment.createdAt), new Date(), { addSuffix: true })}
                        </div>
                        <p className="mt-1">{comment.content}</p>
                        {user && (
                            <button
                                onClick={() => setReplyTo(comment.id)}
                                className="text-sm text-blue-500 mt-1 hover:text-blue-600"
                            >
                                Reply
                            </button>
                        )}
                    </div>
                </div>

                {/* Render child comments */}
                {comment.children && comment.children.length > 0 && (
                    <div className="ml-8 mt-4">
                        {comment.children.map(childComment => renderComment(childComment))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-4">
            {error && (
                <div className="text-red-500 mb-4">{error}</div>
            )}

            {loading ? (
                <div className="text-gray-500">Loading comments...</div>
            ) : (
                <>
                    {/* Comment form */}
                    {user && (
                        <form onSubmit={handleSubmitComment} className="mb-6">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                                className="w-full p-2 border rounded mb-2 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                                rows={3}
                            />
                            <div className="flex justify-end gap-2">
                                {replyTo && (
                                    <button
                                        type="button"
                                        onClick={() => setReplyTo(null)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    disabled={!newComment.trim()}
                                >
                                    {replyTo ? 'Reply' : 'Comment'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Comments list */}
                    <div className="space-y-4">
                        {comments && comments.length > 0 ? (
                            comments
                                .filter(comment => !comment.parentId)
                                .map(comment => renderComment(comment))
                        ) : (
                            <p className="text-gray-500">No comments yet</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}