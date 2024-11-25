'use client';

import React, { useState } from 'react';
import { formatDistance } from 'date-fns';
import CommentSection from './CommentSection';
import { useAuth } from '../context/AuthContext';
import type { BlogPost } from '../types/blog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPostModalProps {
    post: BlogPost;
    onClose: () => void;
    onUpdate: () => void;
}

export default function BlogPostModal({ post, onClose, onUpdate }: BlogPostModalProps) {
    const { user } = useAuth();
    const [votes, setVotes] = useState(post.votes);

    const handleVote = async (type: number) => {
        if (!user) return;

        try {
            const response = await fetch(`/api/blogs/${post.id}/vote`, {
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
                        <h2 className="text-2xl font-bold dark:text-white">{post.title}</h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Posted by {post.author.firstName} {post.author.lastName} •
                            {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
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
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.split(',').map((tag) => (
                        <span
                            key={tag}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-sm"
                        >
                            {tag.trim()}
                        </span>
                    ))}
                </div>

                {/* Templates (if any) */}
                {post.templates && post.templates.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 dark:text-white">Related Templates</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.templates.map(template => (
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
                    <CommentSection postId={post.id} onUpdate={onUpdate} />
                </div>
            </div>
        </div>
    );
} 