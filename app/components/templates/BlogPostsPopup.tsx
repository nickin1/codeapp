import React from 'react';
import Link from 'next/link';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";

interface BlogPostsPopupProps {
    blogPosts: Array<{
        id: string;
        title: string;
    }>;
    isVisible: boolean;
}

export default function BlogPostsPopup({ blogPosts, isVisible }: BlogPostsPopupProps) {
    if (blogPosts.length === 0) return null;

    return (
        <PopoverContent className="w-80 p-0" align="end">
            <div className="px-4 py-2 border-b">
                <div className="text-xs text-muted-foreground">
                    Mentioned in {blogPosts.length} posts:
                </div>
            </div>
            <ScrollArea className="max-h-[200px]">
                {blogPosts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/blog?postId=${post.id}`}
                        className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                        {post.title}
                    </Link>
                ))}
            </ScrollArea>
        </PopoverContent>
    );
} 