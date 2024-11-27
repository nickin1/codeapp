'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { extractTemplateIds } from '../utils/markdown';

interface BlogFormProps {
    post?: {
        id: string;
        title: string;
        content: string;
        tags: string;
        templateIds?: string[];
    };
    onClose: () => void;
    onSubmit: () => void;
}

export default function BlogForm({ post, onClose, onSubmit }: BlogFormProps) {
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const [tags, setTags] = useState(post?.tags || '');
    const { user } = useAuth();



    const handleSubmit = async (e: React.FormEvent) => {
        console.log("DEBUG: handleSubmit called - BEFORE preventDefault");
        e.preventDefault();
        e.stopPropagation();
        console.log("DEBUG: handleSubmit called - AFTER preventDefault");

        if (!user) {
            console.log("DEBUG: No user found, returning");
            return;
        }

        console.log("DEBUG: content", content);
        const templateIds = extractTemplateIds(content);


        console.log("DEBUG: extracted template ids", templateIds);

        try {
            const endpoint = post ? `/api/blogs/${post.id}` : '/api/blogs';
            const method = post ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags,
                    authorId: user.id,
                    templateIds,
                }),
            });

            if (!response.ok) throw new Error('Failed to save post');

            onSubmit();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post. Please try again.');
        }
    };

    return (
        <form
            onSubmit={(e) => {
                console.log("DEBUG: Form onSubmit triggered");
                handleSubmit(e);
            }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl"
        >
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                    {post ? 'Edit Post' : 'Create New Post'}
                </h2>
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-sm rounded">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        To link a template, use markdown format:
                    </p>
                    <code className="block bg-white dark:bg-gray-700 p-2 rounded">
                        [template name](/editor?templateId=template-id)
                    </code>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-xs">
                        You can copy the template ID from the URL when viewing a template in the editor.
                    </p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                        Content (Markdown)
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={15}
                        className="w-full px-3 py-2 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                        Tags (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            console.log("DEBUG: Cancel button clicked");
                            onClose();
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={(e) => {
                            console.log("DEBUG: Submit button clicked");
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        {post ? 'Update' : 'Create'} Post
                    </button>
                </div>
            </div>
        </form>
    );
} 