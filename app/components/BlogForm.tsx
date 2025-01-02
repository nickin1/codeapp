'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { extractTemplateIds } from '../utils/markdown';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';
import 'prismjs/themes/prism-tomorrow.css';
import type { BlogPost } from '../types/blog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TagInput from '@/app/components/TagInput';

interface BlogFormProps {
    post?: Partial<BlogPost>;
    open: boolean;
    onClose: () => void;
    onSubmit: (post: BlogPost) => void;
}

export default function BlogForm({ post, open, onClose, onSubmit }: BlogFormProps) {
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [tags, setTags] = React.useState<string[]>(
        post?.tags ? post.tags.split(',').map(tag => tag.trim()) : []
    );
    const [activeTab, setActiveTab] = React.useState('write');
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);
    const { user } = useAuth();

    // Update initial values ref to handle tags array
    const initialValues = React.useRef({
        title: '',
        content: '',
        tags: [] as string[]
    });

    useEffect(() => {
        if (!open) {
            setIsClosing(false);
            setShowUnsavedChangesDialog(false);
            setActiveTab('write');
            if (!post) {
                setTitle('');
                setContent('');
                setTags([]);
            }
        }
    }, [open, post]);

    useEffect(() => {
        if (post) {
            const values = {
                title: post.title || '',
                content: post.content || '',
                tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : []
            };
            setTitle(values.title);
            setContent(values.content);
            setTags(values.tags);
            initialValues.current = values;
        } else {
            initialValues.current = { title: '', content: '', tags: [] };
        }
    }, [post]);

    const hasUnsavedChanges = () => {
        return title !== initialValues.current.title ||
            content !== initialValues.current.content ||
            tags.join(',') !== initialValues.current.tags.join(',');
    };

    const handleClose = () => {
        if (hasUnsavedChanges()) {
            setShowUnsavedChangesDialog(true);
            setIsClosing(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowUnsavedChangesDialog(false);
        setIsClosing(false);
        onClose();
    };

    const handleCancelClose = () => {
        setShowUnsavedChangesDialog(false);
        setIsClosing(false);
    };

    // Helper function to process markdown content
    const processMarkdown = (text: string) => {
        return text
            .replace(/^\s+/g, '')  // Remove leading whitespace
            .replace(/\s+$/g, '')  // Remove trailing whitespace
            .replace(/\n{3,}/g, '\n\n');  // Replace multiple newlines with double newlines
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const processedContent = processMarkdown(content);
        const templateIds = extractTemplateIds(processedContent);

        try {
            const endpoint = post?.id ? `/api/blogs/${post.id}` : '/api/blogs';
            const method = post?.id ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    title,
                    content: processedContent,
                    tags: tags.length > 0 ? tags.join(',') : '',
                    authorId: user.id,
                    templateIds,
                }),
            });

            if (!response.ok) throw new Error('Failed to save post');

            const updatedPost = await response.json();
            onSubmit(updatedPost);
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post. Please try again.');
        }
    };

    return (
        <>
            <Dialog open={open && !isClosing} onOpenChange={handleClose}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{post?.id ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex items-center gap-4">
                                <TabsList className="h-8">
                                    <TabsTrigger value="write" className="text-xs">Write</TabsTrigger>
                                    <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                                </TabsList>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Post title"
                                    required
                                    className="text-lg flex-1"
                                />
                            </div>

                            <TabsContent value="write" className="mt-4">
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={15}
                                    className="font-mono text-sm resize-none min-h-[400px] whitespace-pre leading-relaxed"
                                    placeholder="Write your post content here using Markdown..."
                                    required
                                />
                            </TabsContent>
                            <TabsContent value="preview" className="mt-4">
                                <div className="min-h-[400px] h-[calc(15*1.5rem+2rem)] border rounded-md overflow-y-auto prose dark:prose-invert max-w-none p-4">
                                    {content.trim() ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw, [rehypePrism, { showLineNumbers: true }]]}
                                        >
                                            {processMarkdown(content)}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="text-muted-foreground">Nothing to preview</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-between items-center gap-4">
                            <div className="flex-1">
                                <TagInput
                                    value={tags}
                                    onChange={setTags}
                                    placeholder="Add tags to your post..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {post?.id ? 'Update' : 'Create'} Post
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showUnsavedChangesDialog} onOpenChange={(open) => {
                setShowUnsavedChangesDialog(open);
                if (!open) {
                    setIsClosing(false);
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to leave?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelClose}>
                            Continue Editing
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmClose}>
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 