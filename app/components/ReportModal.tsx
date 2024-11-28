import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface ReportModalProps {
    contentId: string;
    contentType: 'blogPost' | 'comment';
    onClose: () => void;
    onSubmit: () => void;
}

export default function ReportModal({ contentId, contentType, onClose, onSubmit }: ReportModalProps) {
    const [reason, setReason] = useState('');
    const [additionalExplanation, setAdditionalExplanation] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const endpoint = contentType === 'blogPost'
                ? `/api/blogs/${contentId}/report`
                : `/api/blogs/${contentId.split('-')[0]}/comments/${contentId.split('-')[1]}/report`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    reason,
                    additionalExplanation,
                }),
            });

            if (response.ok) {
                onSubmit();
                onClose();
            }
        } catch (error) {
            console.error('Error submitting report:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                    Report {contentType === 'blogPost' ? 'Blog Post' : 'Comment'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Reason
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                            Additional Explanation
                        </label>
                        <textarea
                            value={additionalExplanation}
                            onChange={(e) => setAdditionalExplanation(e.target.value)}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            rows={4}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 