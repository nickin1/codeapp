'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BlogPostModal from '../components/BlogPostModal';
import BlogForm from '../components/BlogForm';
import SearchBar from '../components/SearchBar';
import type { BlogPost } from '../types/blog';
import { useDebounce } from '../hooks/useDebounce';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import BlogPostCard from '../components/BlogPostCard';

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
    const searchParams = useSearchParams();
    const postId = searchParams?.get('postId');
    const [sortBy, setSortBy] = useState('dateDesc');
    const router = useRouter();

    useEffect(() => {
        const fetchPostFromId = async () => {
            if (!postId) return;

            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await fetch(`/api/blogs/${postId}`, {
                    headers: accessToken ? {
                        'Authorization': `Bearer ${accessToken}`,
                    } : {}
                });
                if (!response.ok) throw new Error('Failed to fetch post');

                const post = await response.json();
                setSelectedPost(post);
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        fetchPostFromId();
    }, [postId]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(
                `/api/blogs/search?searchTerm=${debouncedSearchTerm}&page=${currentPage}&limit=10&sortBy=${sortBy}`,
                {
                    headers: accessToken ? {
                        'Authorization': `Bearer ${accessToken}`,
                    } : {}
                }
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
    }, [debouncedSearchTerm, currentPage, sortBy]);

    const handleVote = async (postId: string, type: number, e: React.MouseEvent) => {
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

                setPosts(currentPosts =>
                    currentPosts.map(post => {
                        if (post.id === postId) {
                            if (data.message === "Vote removed") {
                                return {
                                    ...post,
                                    votes: post.votes.filter(vote => vote.userId !== user.id)
                                };
                            } else {
                                const newVotes = post.votes.filter(vote => vote.userId !== user.id);
                                return {
                                    ...post,
                                    votes: [...newVotes, data]
                                };
                            }
                        }
                        return post;
                    })
                );
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleCloseModal = () => {
        setSelectedPost(null);
        router.push('/blog', { scroll: false });
    };

    const handleSelectPost = (post: BlogPost) => {
        setSelectedPost(post);
        router.push(`/blog?postId=${post.id}`, { scroll: false });
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

            fetchPosts();
        } catch (error) {
            console.error('Error updating content visibility:', error);
        }
    };

    const renderPagination = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <Button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                >
                    {i}
                </Button>
            );
        }

        return (
            <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                >
                    Previous
                </Button>
                {pageNumbers}
                <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                >
                    Next
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full bg-background">
            <div className="container mx-auto py-8 max-w-6xl">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="sm:col-span-3">
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search blog posts..."
                                />
                            </div>
                            <Select
                                value={sortBy}
                                onValueChange={setSortBy}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dateDesc">Newest First</SelectItem>
                                    <SelectItem value="dateAsc">Oldest First</SelectItem>
                                    <SelectItem value="scoreDesc">Highest Score</SelectItem>
                                    <SelectItem value="scoreAsc">Lowest Score</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {user && (
                            <Button
                                onClick={() => setIsCreating(true)}
                                size="default"
                                className="shrink-0 gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Create Post
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="grid gap-6">
                            {posts.map((post) => (
                                <BlogPostCard
                                    key={post.id}
                                    post={post}
                                    user={user}
                                    onVote={handleVote}
                                    onHide={handleHideContent}
                                    onClick={handleSelectPost}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No posts found</p>
                        </div>
                    )}

                    {posts.length > 0 && (
                        <div className="mt-6">
                            {renderPagination()}
                        </div>
                    )}

                    {selectedPost && (
                        <BlogPostModal
                            post={selectedPost}
                            onClose={handleCloseModal}
                            onUpdate={fetchPosts}
                        />
                    )}

                    {isCreating && (
                        <BlogForm
                            open={isCreating}
                            onClose={() => setIsCreating(false)}
                            onSubmit={(newPost) => {
                                setIsCreating(false);
                                fetchPosts();
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
} 