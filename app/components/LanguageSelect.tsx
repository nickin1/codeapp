'use client';

import { SUPPORTED_LANGUAGES } from '@/lib/languages';

interface LanguageSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function LanguageSelect({ value, onChange, disabled }: LanguageSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm disabled:opacity-50"
        >
            {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                    {lang.name}
                </option>
            ))}
        </select>
    );
} 