'use client';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import CommentSection from './CommentSection';
import { formatDistance } from 'date-fns'


// Define Comment type separately to handle recursion
type BlogComment = {
    id: string;
    content: string;
    authorId: string;
    author: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    parentId: string | null;
    votes: Array<{
        type: number;
        userId: string;
    }>;
    // Reference the same type for children
    children?: Comment[];
};

interface BlogPostProps {
    post: {
        id: string;
        title: string;
        content: string;
        tags: string;
        authorId: string;
        author: {
            firstName: string;
            lastName: string;
        };
        templates?: Array<{
            id: string;
            title: string;
        }>;
        votes: Array<{
            type: number;
            userId: string;
        }>;
        comments: BlogComment[];
        createdAt: string;
    };
    onUpdate: () => void;
}

export default function BlogPost({ post, onUpdate }: BlogPostProps) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const score = post.votes.reduce((acc, vote) => acc + vote.type, 0);
    const userVote = user ? post.votes.find(vote => vote.userId === user.id)?.type : 0;

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
                onUpdate();
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-4">
                {/* Voting buttons */}
                <div className="flex flex-col items-center">
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

                {/* Post content */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                    <p className="text-gray-600 mb-4">{post.content}</p>

                    {/* Tags */}
                    <div className="flex gap-2 mb-4">
                        {post.tags.split(',').map((tag) => (
                            <span
                                key={tag}
                                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm"
                            >
                                {tag.trim()}
                            </span>
                        ))}
                    </div>

                    {/* Template links */}
                    {(post.templates?.length ?? 0) > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Related Templates:</h3>
                            <div className="flex gap-2">
                                {post.templates?.map((template) => (
                                    <Link
                                        key={template.id}
                                        href={`/templates/${template.id}`}
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        {template.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta information */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>
                            Posted by {post.author.firstName} {post.author.lastName} • {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="hover:text-gray-700"
                            >
                                Comments
                            </button>
                            {user?.id === post.authorId && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="hover:text-gray-700"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Comments section */}
                    {showComments && (
                        <CommentSection
                            postId={post.id}
                            onUpdate={onUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
} 