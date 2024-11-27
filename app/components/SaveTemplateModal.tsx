'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Button from '@/app/components/ui/Button';

interface SaveTemplateModalProps {
    code: string;
    language: string;
    onClose: () => void;
    initialData?: {
        id: string;
        title: string;
        description: string;
        tags: string;
    } | null;
    isEditing?: boolean;
    isFork?: boolean;
}

export default function SaveTemplateModal({
    code,
    language,
    onClose,
    initialData,
    isEditing,
    isFork,
}: SaveTemplateModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [tags, setTags] = useState(initialData?.tags || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const getModalTitle = () => {
        if (isEditing) return 'Update Template';
        if (isFork) return 'Fork Template';
        return 'Save as Template';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setError('');

        try {
            let endpoint = '/api/templates';
            let method = 'POST';

            if (isEditing && initialData) {
                endpoint = `/api/templates/${initialData.id}`;
                method = 'PUT';
            } else if (isFork && initialData) {
                endpoint = `/api/templates/${initialData.id}/fork`;
                method = 'POST';
            }

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    code,
                    language,
                    tags: tags.split(',')
                        .map(tag => tag.trim())
                        .filter(tag => tag !== '')
                        .join(','),
                    authorId: user.id,
                    ...(isFork && {
                        userId: user.id,
                        newTitle: title,
                        newDescription: description,
                        newCode: code,
                        newLanguage: language,
                        newTags: tags,
                    })
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save template');
            }

            const data = await response.json();

            if (isFork) {
                window.location.href = `/editor/?templateId=${data.newTemplateId}`;
            } else if (isEditing) {
                window.location.reload();
            } else {
                window.location.href = '/templates';
            }
        } catch (error) {
            setError('Failed to save template. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-4">{getModalTitle()}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full rounded-md border bg-transparent px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full rounded-md border bg-transparent px-3 py-2 h-32"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full rounded-md border bg-transparent px-3 py-2"
                            placeholder="e.g., algorithms, sorting, recursion"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSaving}>
                            {isEditing ? 'Update' : isFork ? 'Fork' : 'Save'} Template
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 