'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface Report {
    id: string;
    reason: string;
    additionalExplanation: string;
    reporterId: string;
    createdAt: string;
}

interface Content {
    id: string;
    title?: string;
    content: string;
    authorId: string;
    createdAt: string;
    hidden: boolean;
    report?: Report[];
    reports?: Report[];
    blogPostId?: string;
}

interface PaginationInfo {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

interface ReportedContentResponse {
    items: Content[];
    pagination: PaginationInfo;
}

export default function AdminPanel() {
    const [blogPosts, setBlogPosts] = useState<ReportedContentResponse | null>(null);
    const [comments, setComments] = useState<ReportedContentResponse | null>(null);
    const [loading, setLoading] = useState({ blogs: true, comments: true });
    const [error, setError] = useState<{ blogs?: string; comments?: string } | null>(null);
    const [currentPage, setCurrentPage] = useState({ blogs: 1, comments: 1 });
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (user?.isAdmin) {
                fetchReportedBlogPosts(currentPage.blogs);
            } else if (!user) {
                router.push('/login');
            }
        }
    }, [user, authLoading, currentPage.blogs]);

    useEffect(() => {
        if (!authLoading) {
            if (user?.isAdmin) {
                fetchReportedComments(currentPage.comments);
            } else if (!user) {
                router.push('/login');
            }
        }
    }, [user, authLoading, currentPage.comments]);

    if (authLoading) {
        return <div className="p-4">Loading authentication...</div>;
    }

    const fetchReportedBlogPosts = async (page = 1) => {
        setLoading(prev => ({ ...prev, blogs: true }));
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`/api/admin/blog-reports?page=${page}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reported blog posts');
            }

            const data = await response.json();
            setBlogPosts(data);
            setError(prev => ({ ...prev, blogs: undefined }));
        } catch (err) {
            setError(prev => ({
                ...prev,
                blogs: err instanceof Error ? err.message : 'An error occurred'
            }));
        } finally {
            setLoading(prev => ({ ...prev, blogs: false }));
        }
    };

    const fetchReportedComments = async (page = 1) => {
        setLoading(prev => ({ ...prev, comments: true }));
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`/api/admin/comment-reports?page=${page}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reported comments');
            }

            const data = await response.json();
            setComments(data);
            setError(prev => ({ ...prev, comments: undefined }));
        } catch (err) {
            setError(prev => ({
                ...prev,
                comments: err instanceof Error ? err.message : 'An error occurred'
            }));
        } finally {
            setLoading(prev => ({ ...prev, comments: false }));
        }
    };

    const handleHideContent = async (contentId: string, contentType: string, hide: boolean) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('/api/admin/hide-content', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentId, contentType, hide }),
            });

            if (!response.ok) {
                throw new Error('Failed to update content visibility');
            }

            if (contentType === 'blogPost') {
                fetchReportedBlogPosts(currentPage.blogs);
            } else if (contentType === 'comment') {
                fetchReportedComments(currentPage.comments);
            }
        } catch (err) {
            setError(prev => ({
                ...prev,
                [contentType === 'blogPost' ? 'blogs' : 'comments']:
                    err instanceof Error ? err.message : 'An error occurred'
            }));
        }
    };

    const handlePageChange = (contentType: 'blogs' | 'comments', newPage: number) => {
        setCurrentPage(prev => ({ ...prev, [contentType]: newPage }));
    };

    const PaginationControls = ({
        pagination,
        contentType
    }: {
        pagination: PaginationInfo;
        contentType: 'blogs' | 'comments';
    }) => {
        return (
            <div className="flex justify-center items-center space-x-2 mt-4">
                <button
                    onClick={() => handlePageChange(contentType, pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(contentType, pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Admin Panel - Reported Content</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blog Posts Section */}
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Reported Blog Posts
                        <span className="text-sm font-normal ml-2">
                            (Total: {blogPosts?.pagination.totalItems || 0})
                        </span>
                    </h2>
                    {error?.blogs && (
                        <div className="text-red-500 mb-4">Error: {error.blogs}</div>
                    )}
                    <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {loading.blogs ? (
                            <div>Loading blog posts...</div>
                        ) : blogPosts?.items?.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">No reported blog posts</p>
                        ) : (
                            blogPosts?.items?.map((post) => (
                                <div key={post.id} className="border dark:border-gray-700 p-4 rounded-lg">
                                    <a 
                                        href={`/blog?postId=${post.id}`}
                                        className="block hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                        <h3 className="font-medium">{post.title}</h3>
                                    </a>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Reports: {post.report?.length || 0}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleHideContent(post.id, 'blogPost', !post.hidden)}
                                            className={`px-3 py-1 rounded ${post.hidden
                                                ? 'bg-green-500 hover:bg-green-600'
                                                : 'bg-red-500 hover:bg-red-600'
                                                } text-white transition-colors`}
                                        >
                                            {post.hidden ? 'Unhide' : 'Hide'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {blogPosts && <PaginationControls pagination={blogPosts.pagination} contentType="blogs" />}
                </section>

                {/* Comments Section */}
                <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Reported Comments
                        <span className="text-sm font-normal ml-2">
                            (Total: {comments?.pagination.totalItems || 0})
                        </span>
                    </h2>
                    {error?.comments && (
                        <div className="text-red-500 mb-4">Error: {error.comments}</div>
                    )}
                    <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {loading.comments ? (
                            <div>Loading comments...</div>
                        ) : comments?.items?.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">No reported comments</p>
                        ) : (
                            comments?.items?.map((comment) => (
                                <div key={comment.id} className="border dark:border-gray-700 p-4 rounded-lg">
                                    <a 
                                        href={`/blog?postId=${comment.blogPostId}`}
                                        className="block hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer mb-2"
                                    >
                                        <p>{comment.content}</p>
                                    </a>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Reports: {comment.reports?.length || 0}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleHideContent(comment.id, 'comment', !comment.hidden)}
                                            className={`px-3 py-1 rounded ${comment.hidden
                                                ? 'bg-green-500 hover:bg-green-600'
                                                : 'bg-red-500 hover:bg-red-600'
                                                } text-white transition-colors`}
                                        >
                                            {comment.hidden ? 'Unhide' : 'Hide'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {comments && <PaginationControls pagination={comments.pagination} contentType="comments" />}
                </section>
            </div>
        </div>
    );
} 