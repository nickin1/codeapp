'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
    const [templates, setTemplates] = useState<string[]>(post?.templateIds || []);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const accessToken = localStorage.getItem('accessToken');
        const method = post ? 'PUT' : 'POST';
        const url = post ? `/api/blogs/${post.id}` : '/api/blogs';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags,
                    templateIds: templates,
                    authorId: user?.id,
                }),
            });

            if (response.ok) {
                onSubmit();
            }
        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
            <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 border rounded h-32"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {post ? 'Update' : 'Create'} Post
                </button>
            </div>
        </form>
    );
} 