'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReloadIcon } from '@radix-ui/react-icons';
import TagInput from '@/app/components/TagInput';

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
    const [tags, setTags] = useState<string[]>(
        initialData?.tags ? initialData.tags.split(',').map(tag => tag.trim()) : []
    );
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
                    tags: tags.join(','),
                    authorId: user.id,
                    ...(isFork && {
                        userId: user.id,
                        newTitle: title,
                        newDescription: description,
                        newCode: code,
                        newLanguage: language,
                        newTags: tags.join(','),
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
        <Dialog open={true} onOpenChange={() => onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{getModalTitle()}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="h-32"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <TagInput
                            value={tags}
                            onChange={setTags}
                            placeholder="Press space or enter to add tags"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Update' : isFork ? 'Fork' : 'Save'} Template
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 