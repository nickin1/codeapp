'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BlogPostModal from '../components/BlogPostModal';
import BlogForm from '../components/BlogForm';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { formatDistance } from 'date-fns';
import type { BlogPost } from '../types/blog';
import { useDebounce } from '../hooks/useDebounce';

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [sortBy, setSortBy] = useState('dateDesc'); // Options: dateDesc, dateAsc, scoreDesc, scoreAsc

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/blogs/search?searchTerm=${debouncedSearchTerm}&page=${currentPage}&limit=10`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await response.json();

            setPosts(data.posts || []);
            setTotalPages(data.totalPages || 1);

        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [debouncedSearchTerm, currentPage]);

    const handleVote = async (postId: string, type: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent modal from opening
        if (!user) return;

        try {
            const response = await fetch(`/api/blogs/${postId}/vote`, {
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

                // Update posts state locally instead of refetching
                setPosts(currentPosts =>
                    currentPosts.map(post => {
                        if (post.id === postId) {
                            if (data.message === "Vote removed") {
                                return {
                                    ...post,
                                    votes: post.votes.filter(vote => vote.userId !== user.id)
                                };
                            }
                            const newVotes = post.votes.filter(vote => vote.userId !== user.id);
                            return {
                                ...post,
                                votes: [...newVotes, data]
                            };
                        }
                        return post;
                    })
                );
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    // Add this function to handle sorting
    const sortPosts = (posts: BlogPost[]) => {
        return [...posts].sort((a, b) => {
            switch (sortBy) {
                case 'dateDesc':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'dateAsc':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'scoreDesc':
                    const scoreB = b.votes.reduce((acc, vote) => acc + vote.type, 0);
                    const scoreA = a.votes.reduce((acc, vote) => acc + vote.type, 0);
                    return scoreB - scoreA;
                case 'scoreAsc':
                    const scoreB2 = b.votes.reduce((acc, vote) => acc + vote.type, 0);
                    const scoreA2 = a.votes.reduce((acc, vote) => acc + vote.type, 0);
                    return scoreA2 - scoreB2;
                default:
                    return 0;
            }
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">Blog Posts</h1>
                {user && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Create Post
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <div className="sm:col-span-3">
                    <SearchBar onSearch={setSearchTerm} />
                </div>
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                        <option value="dateDesc">Newest First</option>
                        <option value="dateAsc">Oldest First</option>
                        <option value="scoreDesc">Highest Score</option>
                        <option value="scoreAsc">Lowest Score</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}

            <div className="grid gap-6">
                {!loading && sortPosts(posts).map((post) => (
                    <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={(e) => handleVote(post.id, 1, e)}
                                    className={`p-1 ${user?.id && post.votes.find(vote => vote.userId === user.id)?.type === 1
                                        ? 'text-blue-500'
                                        : 'text-gray-400'}`}
                                    disabled={!user}
                                >
                                    ▲
                                </button>
                                <span className="text-sm font-medium">
                                    {post.votes.reduce((acc, vote) => acc + vote.type, 0)}
                                </span>
                                <button
                                    onClick={(e) => handleVote(post.id, -1, e)}
                                    className={`p-1 ${user?.id && post.votes.find(vote => vote.userId === user.id)?.type === -1
                                        ? 'text-red-500'
                                        : 'text-gray-400'}`}
                                    disabled={!user}
                                >
                                    ▼
                                </button>
                            </div>
                            <div className="flex-1" onClick={() => setSelectedPost(post)}>
                                <h2 className="text-xl font-bold mb-2 dark:text-white">{post.title}</h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{post.content}</p>
                                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                                    <span>
                                        By {post.author.firstName} {post.author.lastName}
                                    </span>
                                    <span>
                                        {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true })}
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    {post.tags.split(',').slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs"
                                        >
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedPost && (
                <BlogPostModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onUpdate={fetchPosts}
                />
            )}

            <div className="mt-6">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
} 