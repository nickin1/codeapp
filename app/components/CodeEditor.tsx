'use client';

import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        if (editorRef.current) {
            monacoEditorRef.current = monaco.editor.create(editorRef.current, {
                value,
                language,
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
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
            if (value !== monacoEditorRef.current.getValue()) {
                monacoEditorRef.current.setValue(value);
            }
        }
    }, [value]);

    useEffect(() => {
        if (monacoEditorRef.current) {
            monaco.editor.setModelLanguage(
                monacoEditorRef.current.getModel()!,
                language
            );
        }
    }, [language]);

    return (
        <div ref={editorRef} className="h-[500px] border rounded-md overflow-hidden" />
    );
}