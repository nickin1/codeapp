export interface Comment {
    id: string;
    content: string;
    authorId: string;
    blogPostId: string;
    createdAt: Date;
    updatedAt: Date;
    parentId?: string | null;
    author: {
        name: string;
        email: string;
    };
}

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
        name: string;
        email: string;
    };
    comments: Comment[];
    tags: string;
    hidden: boolean;
    templates: {
        id: string;
        title: string;
        language: string;
    }[];
}

export interface BlogPostReport {
    id: string;
    reason: string;
    blogPostId: string;
    reporterId: string;
    createdAt: Date;
    blogPost: BlogPost;
    reporter: {
        name: string;
        email: string;
    };
}

export interface CommentReport {
    id: string;
    reason: string;
    commentId: string;
    reporterId: string;
    createdAt: Date;
    comment: Comment;
    reporter: {
        name: string;
        email: string;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        totalItems: number;
        itemsPerPage: number;
        currentPage: number;
        totalPages: number;
    };
}
