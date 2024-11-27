import React from 'react';
import Link from 'next/link';

interface BlogPostsPopupProps {
    blogPosts: Array<{
        id: string;
        title: string;
    }>;
    isVisible: boolean;
}

export default function BlogPostsPopup({ blogPosts, isVisible }: BlogPostsPopupProps) {
    if (!isVisible || blogPosts.length === 0) return null;

    return (
        <div className="fixed z-50 mt-1 w-64 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1 max-h-48 overflow-y-auto">
                <div className="px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Referenced in Blog Posts:
                </div>
                {blogPosts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/blog?postId=${post.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {post.title}
                    </Link>
                ))}
            </div>
        </div>
    );
} 