'use client';

import React, { useState, useEffect } from 'react';

interface Template {
    id: string;
    title: string;
    description: string;
}

interface TemplateSelectorProps {
    selectedTemplates: string[];
    onChange: (templateIds: string[]) => void;
}

export default function TemplateSelector({ selectedTemplates, onChange }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, [searchTerm]);

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`/api/templates/search?searchTerm=${searchTerm}`);
            const data = await response.json();
            setTemplates(data.templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleTemplateToggle = (templateId: string) => {
        const newSelection = selectedTemplates.includes(templateId)
            ? selectedTemplates.filter(id => id !== templateId)
            : [...selectedTemplates, templateId];
        onChange(newSelection);
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Link Templates</label>
            <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded mb-2"
            />
            <div className="max-h-40 overflow-y-auto border rounded">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleTemplateToggle(template.id)}
                    >
                        <input
                            type="checkbox"
                            checked={selectedTemplates.includes(template.id)}
                            onChange={() => { }}
                            className="mr-2"
                        />
                        <div>
                            <div className="font-medium">{template.title}</div>
                            <div className="text-sm text-gray-500">{template.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 