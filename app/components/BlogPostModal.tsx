'use client';

import React, { useState } from 'react';
import { formatDistance } from 'date-fns';
import CommentSection from './CommentSection';
import { useAuth } from '../context/AuthContext';
import type { BlogPost } from '../types/blog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BlogForm from './BlogForm';

interface BlogPostModalProps {
    post: BlogPost;
    onClose: () => void;
    onUpdate: () => void;
}

export default function BlogPostModal({ post: initialPost, onClose, onUpdate }: BlogPostModalProps) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState(initialPost);
    const [votes, setVotes] = useState(initialPost.votes);

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

                // Update votes based on the response
                if (data.message === "Vote removed") {
                    // Remove the vote
                    setVotes(currentVotes =>
                        currentVotes.filter(vote => vote.userId !== user.id)
                    );
                } else {
                    // Add or update the vote
                    setVotes(currentVotes => {
                        const newVotes = currentVotes.filter(vote => vote.userId !== user.id);
                        return [...newVotes, data];
                    });
                }

                onUpdate(); // Still update the parent component
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

            onUpdate();
        } catch (error) {
            console.error('Error updating content visibility:', error);
        }
    };

    const score = votes.reduce((acc, vote) => acc + vote.type, 0);
    const userVote = user ? votes.find(vote => vote.userId === user.id)?.type : 0;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold dark:text-white">{currentPost.title}</h2>
                            {currentPost.hidden && (
                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">Hidden</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-500">
                                Posted by {currentPost.author.firstName} {currentPost.author.lastName} •
                                {formatDistance(new Date(currentPost.createdAt), new Date(), { addSuffix: true })}
                            </div>
                            {user?.id === currentPost.authorId && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        disabled={currentPost.hidden}
                                        className={`px-4 py-2 rounded transition-colors ${currentPost.hidden
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                            }`}
                                    >
                                        Edit Post
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to delete this post?')) {
                                                const response = await fetch(`/api/blogs/${currentPost.id}`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                                                    },
                                                });
                                                if (response.ok) {
                                                    onClose();
                                                    onUpdate();
                                                }
                                            }
                                        }}
                                        disabled={currentPost.hidden}
                                        className={`px-4 py-2 rounded transition-colors ${currentPost.hidden
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                            }`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                            {user?.isAdmin && (
                                <button
                                    onClick={() => handleHideContent(currentPost.id, 'blogPost', !currentPost.hidden)}
                                    className={`px-3 py-1 rounded ${currentPost.hidden
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                                >
                                    {currentPost.hidden ? 'Unhide' : 'Hide'}
                                </button>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Voting */}
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => handleVote(1)}
                        className={`p-1 ${userVote === 1 ? 'text-blue-500' : 'text-gray-400'}`}
                        disabled={!user}
                    >
                        ▲
                    </button>
                    <span className="text-sm font-medium">{score}</span>
                    <button
                        onClick={() => handleVote(-1)}
                        className={`p-1 ${userVote === -1 ? 'text-red-500' : 'text-gray-400'}`}
                        disabled={!user}
                    >
                        ▼
                    </button>
                </div>

                {/* Content */}
                <div className="prose dark:prose-invert max-w-none mb-6">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="markdown-content"
                    >
                        {currentPost.content}
                    </ReactMarkdown>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {currentPost.tags.split(',').map((tag) => (
                        <span
                            key={tag}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm"
                        >
                            {tag.trim()}
                        </span>
                    ))}
                </div>

                {/* Templates (if any) */}
                {currentPost.templates && currentPost.templates.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">Related Templates</h3>
                        <div className="flex flex-wrap gap-2">
                            {currentPost.templates.map(template => (
                                <span
                                    key={template.id}
                                    className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 px-2 py-1 rounded text-sm"
                                >
                                    {template.title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <div className="border-t dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Comments</h3>
                    <CommentSection postId={currentPost.id} onUpdate={onUpdate} />
                </div>

                {/* Edit Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl">
                            <BlogForm
                                post={currentPost}
                                onClose={() => setIsEditing(false)}
                                onSubmit={async () => {
                                    // Fetch the updated post
                                    const response = await fetch(`/api/blogs/${currentPost.id}`);
                                    if (response.ok) {
                                        const updatedPost = await response.json();
                                        setCurrentPost(updatedPost);
                                        setIsEditing(false);
                                        onUpdate(); // Still update the parent component
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 