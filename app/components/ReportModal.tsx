'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface ReportModalProps {
    contentId: string;
    contentType: 'blogPost' | 'comment';
    onClose: () => void;
    onSubmit: () => void;
    open: boolean;
}

export default function ReportModal({ contentId, contentType, onClose, onSubmit, open }: ReportModalProps) {
    const [reason, setReason] = useState('');
    const [additionalExplanation, setAdditionalExplanation] = useState('');
    const [isOpen, setIsOpen] = useState(open);
    const { user } = useAuth();

    const handleClose = () => {
        setIsOpen(false);
        // Add a small delay to allow the animation to complete
        setTimeout(onClose, 300);
    };

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
                toast({
                    title: "Report submitted",
                    description: `The ${contentType === 'blogPost' ? 'post' : 'comment'} has been reported successfully.`,
                });
                setTimeout(handleClose, 100);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit report.",
                variant: "destructive",
            });
            console.error('Error submitting report:', error);
        }
    };

    // Update isOpen when the open prop changes
    React.useEffect(() => {
        if (open) {
            setIsOpen(true);
        }
    }, [open]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Report {contentType === 'blogPost' ? 'Blog Post' : 'Comment'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Input
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="explanation">Additional Explanation</Label>
                        <Textarea
                            id="explanation"
                            value={additionalExplanation}
                            onChange={(e) => setAdditionalExplanation(e.target.value)}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                        >
                            Submit Report
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 