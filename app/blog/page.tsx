'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BlogPostModal from '../components/BlogPostModal';
import BlogForm from '../components/BlogForm';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { formatDistance } from 'date-fns';
import type { BlogPost } from '../types/blog';

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/blogs/search?searchTerm=${searchTerm}&page=${currentPage}&limit=10`
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
    }, [searchTerm, currentPage]);

    return (
        <div className="max-w-4xl mx-auto p-4">
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

            <SearchBar onSearch={setSearchTerm} />

            {isCreating && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl">
                        <BlogForm
                            onClose={() => setIsCreating(false)}
                            onSubmit={() => {
                                setIsCreating(false);
                                fetchPosts();
                            }}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="grid gap-6 mt-6">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
                        >
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
                    ))}
                </div>
            )}

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