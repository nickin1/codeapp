'use client';

import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface LanguageSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function LanguageSelect({ value, onChange, disabled }: LanguageSelectProps) {
    return (
        <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled}
        >
            <SelectTrigger className="w-full sm:w-[180px] cursor-pointer">
                <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="max-h-[50vh]">
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem
                        key={lang.id}
                        value={lang.id}
                        className="cursor-pointer"
                    >
                        {lang.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
} 