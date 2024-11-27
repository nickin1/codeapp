'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import dynamic from 'next/dynamic';
import LanguageSelect from '@/app/components/LanguageSelect';
import ExecutionOutput from '@/app/components/ExecutionOutput';
import SaveTemplateModal from '@/app/components/SaveTemplateModal';
import Button from '@/app/components/ui/Button';
import { DEFAULT_CODE } from '@/lib/defaultCode';
import { useSearchParams } from 'next/navigation';

interface OutputItem {
    type: 'error' | 'stdout' | 'stderr' | 'status';
    data: string;
}

interface TemplateActions {
    canEdit: boolean;
    canDelete: boolean;
    canFork: boolean;
}

const CodeEditor = dynamic(() => import('@/app/components/CodeEditor'), {
    ssr: false
});

export default function EditorPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const templateId = searchParams?.get('templateId');
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
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

    useEffect(() => {
        if (!isEditingTemplate) {
            setCode(DEFAULT_CODE[language] || '// Start coding here');
        }
    }, [language, isEditingTemplate]);

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!templateId) return;

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
            }
        };

        fetchTemplate();
    }, [templateId, user]);

    const handleSaveTemplate = async (data: { title: string, description: string, tags: string }) => {
        if (!user) {
            alert('You must be logged in to save templates');
            return;
        }

        try {
            const endpoint = isEditingTemplate
                ? `/api/templates/${templateId}`
                : '/api/templates';

            const method = isEditingTemplate ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    ...data,
                    code,
                    language,
                    authorId: user.id,
                }),
            });

            if (!response.ok) throw new Error('Failed to save template');

            setShowSaveModal(false);
            alert(`Template ${isEditingTemplate ? 'updated' : 'saved'} successfully!`);
            window.location.href = '/templates';
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template');
        }
    };

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
        if (!templateId || !confirm('Are you sure you want to delete this template?')) return;

        try {
            const response = await fetch(`/api/templates/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete template');

            alert('Template deleted successfully');
            window.location.href = '/templates';
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template');
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
        if (!confirm('Are you sure you want to exit the template view? Any unsaved changes will be lost.')) {
            return;
        }

        setIsEditingTemplate(false);
        setTemplateData(null);
        setCode(DEFAULT_CODE[language] || '// Start coding here');
        window.history.pushState({}, '', '/editor');
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/editor?templateId=${templateId}`;
        navigator.clipboard.writeText(link);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    return (
        <main className="flex-1 p-4">
            <div className="max-w-7xl mx-auto space-y-4">
                {isEditingTemplate && templateData && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h1 className="text-xl font-bold mb-2">
                            {templateActions.canEdit ? 'Editing Template: ' : 'Viewing Template: '}
                            {templateData.title}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{templateData.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {templateData.tags.split(',').map((tag, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 rounded">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
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
                                variant="secondary"
                                onClick={handleExitTemplateView}
                            >
                                Exit Template View
                            </Button>
                        )}
                    </div>
                    <div className="space-x-2">
                        <Button onClick={handleExecute} isLoading={isExecuting}>
                            Run Code
                        </Button>
                        {user && (
                            <>
                                {isEditingTemplate ? (
                                    <>
                                        {templateActions.canEdit && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => setShowSaveModal(true)}
                                            >
                                                Update Template
                                            </Button>
                                        )}
                                        {templateActions.canDelete && (
                                            <Button
                                                variant="danger"
                                                onClick={handleDelete}
                                            >
                                                Delete Template
                                            </Button>
                                        )}
                                        {templateActions.canFork && (
                                            <Button
                                                variant="secondary"
                                                onClick={handleFork}
                                            >
                                                Fork Template
                                            </Button>
                                        )}
                                        <Button
                                            variant="secondary"
                                            onClick={handleCopyLink}
                                        >
                                            {copyFeedback ? 'Copied!' : 'Copy Link'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowSaveModal(true)}
                                    >
                                        Save as Template
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <CodeEditor
                            value={code}
                            onChange={setCode}
                            language={language}
                        />
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Standard Input
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full h-32 rounded-md border bg-transparent p-2"
                                placeholder="Enter program input here..."
                            />
                        </div>
                    </div>
                    <ExecutionOutput output={output} />
                </div>
            </div>

            {showSaveModal && (
                <SaveTemplateModal
                    code={code}
                    language={language}
                    onClose={() => setShowSaveModal(false)}
                    initialData={templateData}
                    isEditing={isEditingTemplate && templateActions.canEdit}
                    isFork={isEditingTemplate && templateActions.canFork}
                />
            )}
        </main>
    );
} 