'use client';

import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useTheme } from '@/app/context/ThemeContext';
import { Card } from "@/components/ui/card";

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
    theme?: 'light' | 'dark';
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        monaco.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#00000000',
                'focusBorder': '#00000000',
                'editorWidget.border': '#00000000',
                'editor.lineHighlightBorder': '#00000000',
                'editor.selectionBackground': '#add6ff80',
                'editor.inactiveSelectionBackground': '#00000000',
                'editorBracketMatch.border': '#00000000',
                'editorOverviewRuler.border': '#00000000'
            }
        });

        monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#00000000',
                'focusBorder': '#00000000',
                'editorWidget.border': '#00000000',
                'editor.lineHighlightBorder': '#00000000',
                'editor.selectionBackground': '#264f7880',
                'editor.inactiveSelectionBackground': '#00000000',
                'editorBracketMatch.border': '#00000000',
                'editorOverviewRuler.border': '#00000000'
            }
        });

        if (editorRef.current) {
            monacoEditorRef.current = monaco.editor.create(editorRef.current, {
                value,
                language: getMonacoLanguage(language),
                theme: theme === 'dark' ? 'custom-dark' : 'custom-light',
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                renderLineHighlight: 'none',
            });

            monacoEditorRef.current.onDidChangeModelContent(() => {
                onChange(monacoEditorRef.current?.getValue() || '');
            });
        }

        return () => {
            monacoEditorRef.current?.dispose();
        };
    }, []);

    useEffect(() => {
        if (monacoEditorRef.current) {
            monaco.editor.setTheme(theme === 'dark' ? 'custom-dark' : 'custom-light');
        }
    }, [theme]);

    useEffect(() => {
        if (monacoEditorRef.current) {
            if (value !== monacoEditorRef.current.getValue()) {
                monacoEditorRef.current.setValue(value);
            }
        }
    }, [value]);

    useEffect(() => {
        if (monacoEditorRef.current) {
            const model = monacoEditorRef.current.getModel();
            if (model) {
                monaco.editor.setModelLanguage(model, getMonacoLanguage(language));
            }
        }
    }, [language]);

    const getMonacoLanguage = (langId: string): string => {
        const monacoMap: { [key: string]: string } = {
            python: 'python',
            javascript: 'javascript',
            typescript: 'typescript',
            cpp: 'cpp',
            c: 'c',
            java: 'java',
            rust: 'rust',
            go: 'go',
            racket: 'scheme',
            ruby: 'ruby'
        };
        return monacoMap[langId] || langId;
    };

    return (
        <Card className="overflow-hidden h-full rounded-sm">
            <div ref={editorRef} className="h-full rounded-sm" />
        </Card>
    );
}