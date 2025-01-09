'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import LanguageSelect from '@/app/components/editor/LanguageSelect';
import ExecutionOutput from '@/app/components/editor/ExecutionOutput';
import SaveTemplateModal from '@/app/components/SaveTemplateModal';
import { DEFAULT_CODE } from '@/lib/defaultCode';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/app/context/ThemeContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link2 } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

interface OutputItem {
    type: 'error' | 'stdout' | 'stderr' | 'status';
    data: string;
}

interface TemplateActions {
    canEdit: boolean;
    canDelete: boolean;
    canFork: boolean;
}

const CodeEditor = dynamic(() => import('@/app/components/editor/CodeEditor'), {
    ssr: false,
    loading: () => (
        <Card className="overflow-hidden bg-background">
            <div className="h-[500px] bg-muted p-4 space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-[60%] bg-muted-foreground/20" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-[75%] bg-muted-foreground/20" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-[40%] bg-muted-foreground/20" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-[55%] bg-muted-foreground/20" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-[68%] bg-muted-foreground/20" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-[45%] bg-muted-foreground/20" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-[80%] bg-muted-foreground/20" />
                </div>
            </div>
        </Card>
    ),
});

export default function EditorPage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const templateId = searchParams?.get('templateId');
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(!!templateId);
    const [templateData, setTemplateData] = useState<{
        id: string;
        title: string;
        description: string;
        tags: string;
    } | null>(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [input, setInput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [output, setOutput] = useState<OutputItem[]>([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [templateActions, setTemplateActions] = useState<TemplateActions>({
        canEdit: false,
        canDelete: false,
        canFork: false,
    });
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);
    const [copyTimeout, setCopyTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isEditingTemplate) {
            setCode(DEFAULT_CODE[language] || '// Start coding here');
        }
    }, [language, isEditingTemplate]);

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!templateId) return;
            setIsLoadingTemplate(true);

            try {
                const response = await fetch(`/api/templates/${templateId}`);
                if (!response.ok) throw new Error('Failed to fetch template');

                const template = await response.json();
                setCode(template.code);
                setLanguage(template.language.toLowerCase());
                setTemplateData({
                    id: template.id,
                    title: template.title,
                    description: template.description || '',
                    tags: template.tags
                });
                setIsEditingTemplate(true);

                if (user) {
                    setTemplateActions({
                        canEdit: user.id === template.authorId,
                        canDelete: user.id === template.authorId,
                        canFork: user.id !== template.authorId,
                    });
                }
            } catch (error) {
                console.error('Error fetching template:', error);
            } finally {
                setIsLoadingTemplate(false);
            }
        };

        fetchTemplate();
    }, [templateId, user]);

    const handleExecute = async () => {
        setIsExecuting(true);
        setOutput([]);

        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({ code, language, input }),
            });

            const reader = response.body?.getReader();
            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                const events = text.split('\n\n').filter(Boolean);

                events.forEach(event => {
                    const data = JSON.parse(event.replace('data: ', ''));
                    setOutput(prev => [...prev, data]);
                });
            }
        } catch (error) {
            console.error('Execution error:', error);
            setOutput(prev => [...prev, { type: 'error', data: 'Failed to execute code' }]);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleDelete = async () => {
        if (!templateId) return;

        try {
            const response = await fetch(`/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete template');
            window.location.href = '/templates';
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const handleFork = async () => {
        if (!user) {
            alert('Please sign in to fork templates');
            return;
        }

        setShowSaveModal(true);
    };

    const handleExitTemplateView = () => {
        setIsEditingTemplate(false);
        setTemplateData(null);
        setCode(DEFAULT_CODE[language] || '// Start coding here');
        window.history.pushState({}, '', '/editor');
    };

    const handleCopyLink = () => {
        if (copyTimeout) {
            clearTimeout(copyTimeout);
        }

        const link = `${window.location.origin}/editor?templateId=${templateId}`;
        navigator.clipboard.writeText(link);
        setCopyFeedback(true);
        setShowCopyTooltip(true);

        const timeout = setTimeout(() => {
            setShowCopyTooltip(false);
            setTimeout(() => {
                setCopyFeedback(false);
            }, 150);
        }, 1000);

        setCopyTimeout(timeout);
    };

    useEffect(() => {
        return () => {
            if (copyTimeout) {
                clearTimeout(copyTimeout);
            }
        };
    }, [copyTimeout]);

    if (isLoadingTemplate) {
        return (
            <div className="container mx-auto p-4">
                <div className="max-w-7xl mx-auto space-y-4">
                    <Card className="bg-muted">
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-[250px] bg-muted-foreground/20" />
                                <Skeleton className="h-4 w-full max-w-[600px] bg-muted-foreground/20" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-5 w-16 bg-muted-foreground/20" />
                                <Skeleton className="h-5 w-20 bg-muted-foreground/20" />
                                <Skeleton className="h-5 w-14 bg-muted-foreground/20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-7xl mx-auto space-y-4">
                {isEditingTemplate && templateData && (
                    <Card className="bg-muted">
                        <CardContent className="p-4 space-y-2">
                            <h1 className="text-xl font-bold text-foreground">
                                {templateActions.canEdit ? 'Editing Template: ' : 'Viewing Template: '}
                                {templateData.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">{templateData.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {templateData.tags.split(',').map((tag, index) => (
                                    <Badge key={index} variant="secondary">
                                        {tag.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <LanguageSelect
                            value={language}
                            onChange={setLanguage}
                            disabled={isEditingTemplate && !templateActions.canEdit}
                        />
                        {isEditingTemplate && (
                            <Button
                                variant="outline"
                                onClick={() => setShowExitDialog(true)}
                                className="text-foreground"
                            >
                                Exit Template View
                            </Button>
                        )}
                    </div>
                    <div className="space-x-2 flex items-center">
                        <Button
                            onClick={handleExecute}
                            disabled={isExecuting}
                        >
                            {isExecuting && <ReloadIcon className="h-4 w-4 mr-2 animate-spin" />}
                            {isExecuting ? "Running..." : "Run Code"}
                        </Button>
                        {user && (
                            <>
                                {isEditingTemplate ? (
                                    <>
                                        {templateActions.canEdit && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowSaveModal(true)}
                                                className="text-foreground"
                                            >
                                                Update Template
                                            </Button>
                                        )}
                                        {templateActions.canDelete && (
                                            <Button
                                                variant="destructive"
                                                onClick={() => setShowDeleteDialog(true)}
                                            >
                                                Delete Template
                                            </Button>
                                        )}
                                        {templateActions.canFork && (
                                            <Button
                                                variant="outline"
                                                onClick={handleFork}
                                                className="text-foreground"
                                            >
                                                Fork Template
                                            </Button>
                                        )}
                                        <TooltipProvider>
                                            <Tooltip open={showCopyTooltip}>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        onClick={handleCopyLink}
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 border-muted-foreground/30 hover:bg-muted hover:text-foreground"
                                                    >
                                                        <Link2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {copyFeedback ? 'Copied link to template!' : 'Copy template link'}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowSaveModal(true)}
                                        className="text-foreground"
                                    >
                                        Save as Template
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <ResizablePanelGroup
                    direction="horizontal"
                    className="min-h-[600px] rounded-xl border"
                >
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <ResizablePanelGroup direction="vertical">
                            <ResizablePanel defaultSize={70} minSize={40}>
                                <div className="p-2 h-full">
                                    <div className="h-full">
                                        <CodeEditor
                                            value={code}
                                            onChange={setCode}
                                            language={language}
                                            theme={theme}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle />
                            <ResizablePanel defaultSize={30} minSize={15}>
                                <div className="p-2 h-full">
                                    <div className="h-full">
                                        <Textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Enter program input here..."
                                            className="font-mono bg-background/50 backdrop-blur-sm text-foreground border-border h-full resize-none rounded-sm"
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="p-2 h-full">
                            <div className="h-full">
                                <ExecutionOutput output={output} className="rounded-sm" />
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            {showSaveModal && (
                <SaveTemplateModal
                    code={code}
                    language={language}
                    onClose={() => setShowSaveModal(false)}
                    initialData={templateData}
                    isEditing={isEditingTemplate && templateActions.canEdit}
                    isFork={isEditingTemplate && templateActions.canFork}
                    onSubmit={() => { }}
                />
            )}

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this template? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Exit Template View</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to exit? Any unsaved changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleExitTemplateView}>
                            Exit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 