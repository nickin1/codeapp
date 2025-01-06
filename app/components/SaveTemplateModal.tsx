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
import { useToast } from "@/hooks/use-toast";

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
    onSubmit: (data: any) => void;
}

export default function SaveTemplateModal({
    code,
    language,
    onClose,
    initialData,
    isEditing,
    isFork,
    onSubmit,
}: SaveTemplateModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
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

        try {
            setIsSaving(true);
            setError('');

            const templateData = {
                title,
                description,
                code,
                language,
                tags: tags.filter(tag => tag.trim()),
                userId: user.id
            };

            const endpoint = isFork
                ? `/api/templates/${initialData?.id}/fork`
                : isEditing
                    ? `/api/templates/${initialData?.id}`
                    : '/api/templates';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(templateData)
            });

            if (!response.ok) {
                throw new Error('Failed to save template');
            }

            const result = await response.json();

            toast({
                title: isEditing ? "Template Updated" : isFork ? "Template Forked" : "Template Saved",
                description: isEditing
                    ? "Your template has been updated successfully."
                    : isFork
                        ? "Template has been forked successfully."
                        : "Your template has been saved successfully.",
                duration: 3000,
            });

            onClose();
            onSubmit(result);

            if (isEditing) {
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            toast({
                title: "Error",
                description: "Failed to save template. Please try again.",
                variant: "destructive",
                duration: 3000,
            });
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