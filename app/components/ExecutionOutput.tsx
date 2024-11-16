'use client';

interface OutputItem {
    type: 'stdout' | 'stderr' | 'status' | 'error';
    data: string;
}

interface ExecutionOutputProps {
    output: OutputItem[];
}

export default function ExecutionOutput({ output }: ExecutionOutputProps) {
    return (
        <div className="border rounded-md p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm h-[600px] overflow-auto border-gray-200 dark:border-gray-700">
            {output.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">Output will appear here...</div>
            ) : (
                output.map((item, index) => (
                    <div
                        key={index}
                        className={`whitespace-pre-wrap ${item.type === 'error' || item.type === 'stderr'
                            ? 'text-red-600 dark:text-red-400'
                            : item.type === 'status'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                    >
                        {item.data}
                    </div>
                ))
            )}
        </div>
    );
} 