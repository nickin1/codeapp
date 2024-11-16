'use client';

const SUPPORTED_LANGUAGES = {
    python: 'Python',
    javascript: 'JavaScript',
    cpp: 'C++',
    java: 'Java',
    c: 'C',
};

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
            {Object.entries(SUPPORTED_LANGUAGES).map(([key, label]) => (
                <option key={key} value={key}>
                    {label}
                </option>
            ))}
        </select>
    );
} 