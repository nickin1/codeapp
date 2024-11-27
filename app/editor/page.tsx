'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import dynamic from 'next/dynamic';
import LanguageSelect from '@/app/components/LanguageSelect';
import ExecutionOutput from '@/app/components/ExecutionOutput';
import SaveTemplateModal from '@/app/components/SaveTemplateModal';
import Button from '@/app/components/ui/Button';
import { DEFAULT_CODE } from '@/lib/defaultCode';

interface OutputItem {
    type: 'error' | 'stdout' | 'stderr' | 'status';
    data: string;
}

const CodeEditor = dynamic(() => import('@/app/components/CodeEditor'), {
    ssr: false
});

export default function EditorPage() {
    const { user } = useAuth();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [input, setInput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [output, setOutput] = useState<OutputItem[]>([]);
    const [showSaveModal, setShowSaveModal] = useState(false);

    useEffect(() => {
        setCode(DEFAULT_CODE[language] || '// Start coding here');
    }, [language]);

    const handleSaveTemplate = async (data: { title: string, description: string, tags: string }) => {
        if (!user) {
            alert('You must be logged in to save templates');
            return;
        }

        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    ...data,
                    code,
                    language,
                    authorId: user.id,
                    forked: false
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save template');
            }

            setShowSaveModal(false);
            alert('Template saved successfully!');
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

    return (
        <main className="flex-1 p-4">
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex justify-between items-center">
                    <LanguageSelect value={language} onChange={setLanguage} />
                    <div className="space-x-2">
                        <Button onClick={handleExecute} isLoading={isExecuting}>
                            Run Code
                        </Button>
                        {user && (
                            <Button variant="secondary" onClick={() => setShowSaveModal(true)}>
                                Save as Template
                            </Button>
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
                // onSave={handleSaveTemplate}
                />
            )}
        </main>
    );
} 