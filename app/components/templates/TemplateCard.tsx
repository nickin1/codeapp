import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import EditTemplateModal from '../EditTemplateModal';
import BlogPostsPopup from './BlogPostsPopup';

interface TemplateCardProps {
    template: {
        id: string;
        title: string;
        description?: string;
        code: string;
        language: string;
        tags: string;
        authorId: string;
        author?: {
            firstName: string;
            lastName: string;
        };
        forked: boolean;
        createdAt: Date;
        updatedAt: Date;
        blogPosts: Array<{
            id: string;
            title: string;
        }>;
    };
    onDelete?: (id: string) => void;
    onUpdate?: () => void;
}

export default function TemplateCard({ template, onDelete, onUpdate }: TemplateCardProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [showBlogPosts, setShowBlogPosts] = useState(false);

    const handleViewInEditor = () => {
        router.push(`/editor?templateId=${template.id}`);
    };

    const isOwner = user?.id === template.authorId;

    const blogPostsButton = (
        <div className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowBlogPosts(!showBlogPosts);
                }}
                onBlur={() => setTimeout(() => setShowBlogPosts(false), 200)}
                className={`px-2 py-1 text-xs rounded-full ${template.blogPosts.length > 0
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
            >
                {template.blogPosts.length} Blog Post{template.blogPosts.length !== 1 ? 's' : ''}
            </button>
            <BlogPostsPopup
                blogPosts={template.blogPosts}
                isVisible={showBlogPosts}
            />
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full">
            <div className="p-4 flex-1 overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {template.title}
                    </h3>
                    <div className="flex items-center gap-2 relative">
                        {template.forked && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                Forked
                            </span>
                        )}
                        {blogPostsButton}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>by {template.author
                        ? `${template.author.firstName} ${template.author.lastName}`
                        : 'Unknown Author'
                    }</span>
                    {isOwner && (
                        <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                            Your Template
                        </span>
                    )}
                </div>
                {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 overflow-y-auto max-h-24">
                        {template.description}
                    </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded">
                        {template.language}
                    </span>
                    {template.tags.split(',').map((tag: string, index: number) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-200 rounded"
                        >
                            {tag.trim()}
                        </span>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
                <button
                    onClick={handleViewInEditor}
                    className="w-3/4 mx-auto block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    View in Code Editor
                </button>
            </div>
        </div>
    );
}