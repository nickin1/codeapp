'use client';

import { SUPPORTED_LANGUAGES } from '@/lib/languages';

interface LanguageSelectProps {
    value: string;
    onChange: (language: string) => void;
}

export default function LanguageSelect({ value, onChange }: LanguageSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-48 rounded-md border bg-transparent px-3 py-2"
        >
            {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                    {lang.name}
                </option>
            ))}
        </select>
    );
} 