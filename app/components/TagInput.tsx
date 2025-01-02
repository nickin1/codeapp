'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export default function TagInput({
    value,
    onChange,
    placeholder = "Add tags..."
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [localTags, setLocalTags] = useState<string[]>(value);

    // Keep local tags in sync with parent value
    useEffect(() => {
        setLocalTags(value);
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === ' ' || e.key === 'Enter') && inputValue.trim()) {
            e.preventDefault();
            const newTag = inputValue.trim().toLowerCase();
            if (!localTags.includes(newTag)) {
                const updatedTags = [...localTags, newTag];
                setLocalTags(updatedTags);
                onChange(updatedTags);
            }
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && localTags.length > 0) {
            const updatedTags = localTags.slice(0, -1);
            setLocalTags(updatedTags);
            onChange(updatedTags);
        }
    };

    const removeTag = (tagToRemove: string) => {
        const updatedTags = localTags.filter(tag => tag !== tagToRemove);
        setLocalTags(updatedTags);
        onChange(updatedTags);
    };

    return (
        <div className="min-h-[42px] flex flex-wrap items-start gap-2 p-2 border rounded-md bg-background">
            <div className="flex flex-wrap items-center gap-1.5 w-full">
                {localTags.length > 0 && localTags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className="flex h-6 items-center gap-1 px-2 text-sm"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-destructive"
                        >
                            <X size={12} />
                        </button>
                    </Badge>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-[120px] bg-transparent outline-none h-6"
                    placeholder={localTags.length === 0 ? placeholder : ""}
                />
            </div>
        </div>
    );
} 