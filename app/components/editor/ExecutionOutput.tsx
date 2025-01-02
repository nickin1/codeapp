'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface OutputItem {
    type: 'stdout' | 'stderr' | 'status' | 'error';
    data: string;
}

interface ExecutionOutputProps {
    output: OutputItem[];
}

export default function ExecutionOutput({ output }: ExecutionOutputProps) {
    return (
        <Card>
            <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-4 font-mono text-sm">
                    {output.length === 0 ? (
                        <div className="text-muted-foreground">Output will appear here...</div>
                    ) : (
                        output.map((item, index) => (
                            <div
                                key={index}
                                className={`whitespace-pre-wrap ${item.type === 'error' || item.type === 'stderr'
                                    ? 'text-destructive'
                                    : item.type === 'status'
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : ''
                                    }`}
                            >
                                {item.data}
                            </div>
                        ))
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
} 