import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from '@/lib/authorization';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === "GET") {
        try {
            const session = await getServerSession(req, res, authOptions);
            const userId = session?.user?.id;

            const blogPost = await prisma.blogPost.findUnique({
                where: { id },
                include: {
                    author: true,
                    votes: true,
                    comments: {
                        include: {
                            author: true,
                            votes: true,
                        }
                    },
                    templates: true
                }
            });

            if (!blogPost) {
                return res.status(404).json({ error: "Blog post not found" });
            }

            // Authorization check for hidden posts
            if (blogPost.hidden && !session?.user?.isAdmin && blogPost.authorId !== userId) {
                return res.status(404).json({ error: "Blog post unavailable" });
            }

            // Transform flat comments into a tree structure
            const commentTree = [];
            const commentMap = new Map();

            // First, create a map of all comments
            blogPost.comments.forEach(comment => {
                commentMap.set(comment.id, { ...comment, children: [] });
            });

            // Then, build the tree structure
            blogPost.comments.forEach(comment => {
                const commentWithChildren = commentMap.get(comment.id);
                if (comment.parentId === null) {
                    commentTree.push(commentWithChildren);
                } else {
                    const parent = commentMap.get(comment.parentId);
                    if (parent) {
                        parent.children.push(commentWithChildren);
                    }
                }
            });

            // Replace flat comments with tree structure
            blogPost.comments = commentTree;

            // Filter comments based on user's authorization level
            const filterComments = (comments) => {
                return comments.map(comment => {
                    // Create a copy of the comment
                    const filteredComment = { ...comment };

                    // If there are children, recursively filter them
                    if (comment.children?.length > 0) {
                        filteredComment.children = filterComments(comment.children);
                    }

                    // For non-admins and non-authors, remove hidden comments
                    if (!session?.user?.isAdmin && comment.authorId !== userId && comment.hidden) {
                        return null;
                    }

                    return filteredComment;
                }).filter(Boolean); // Remove null entries
            };

            const filteredComments = filterComments(blogPost.comments);

            // Create a response object without the original comments
            const responseBlogPost = {
                ...blogPost,
                comments: filteredComments,
            };

            return res.status(200).json(responseBlogPost);
        } catch (error) {
            console.error("Error occurred when retrieving blog post:", error);
            if (error.code === "P2025") {
                res.status(404).json({ error: "Blog post not found" });
            } else {
                res.status(500).json({ error: "Failed to retrieve blog post" });
            }
        }
    }
    else if (req.method === "PUT") {
        const { title, content, templateIds, tags } = req.body;

        try {
            const blogPost = await prisma.blogPost.findUnique({
                where: { id },
            });

            if (!blogPost) {
                return res.status(404).json({ error: "Blog post not found" });
            }

            // Authorization check
            const authResult = await authorizeRequest(req, blogPost.authorId, res);
            if (!authResult.authorized) {
                return res.status(403).json({ error: authResult.error });
            }

            if (blogPost.hidden) {
                return res.status(403).json({ error: "This post is hidden, you do not have permission to edit it" });
            }

            const updatedBlogPost = await prisma.blogPost.update({
                where: {
                    id
                },
                data: {
                    title,
                    content,
                    templates: templateIds ? {
                        set: templateIds.map(id => ({ id }))
                    } : undefined,
                    // Ensure tags is always a string, even if empty
                    tags: tags || ''
                },
                include: {
                    author: true,
                    comments: true,
                    templates: true,
                    reports: true,
                },
            });

            return res.status(200).json(updatedBlogPost);
        } catch (error) {
            console.error("Error updating blog post:", error);
            if (error.code === "P2025") {
                console.error("Error updating blogpost:", error);
                res.status(404).json({ error: "Blog post not found" });
            } else {
                res.status(500).json({ error: "Failed to update blog post" });
            }
        }
    }
    else if (req.method === "DELETE") {
        try {
            const blogPost = await prisma.blogPost.findUnique({
                where: { id },
                include: {
                    templates: true
                }
            });

            if (!blogPost) {
                return res.status(404).json({ error: "Blog post not found" });
            }


            // Authorization check
            const authResult = await authorizeRequest(req, blogPost.authorId, res);
            if (!authResult.authorized) {
                return res.status(403).json({ error: authResult.error });
            }

            // Delete the blog post (Prisma will handle cleaning up the join table)
            const deletedBlogPost = await prisma.blogPost.delete({
                where: { id },
                include: {
                    comments: true,
                    votes: true,
                    templates: true
                }
            });

            return res.status(200).json(deletedBlogPost);
        } catch (error) {
            console.error(`Error deleting blog post ${id}:`, error);
            return res.status(500).json({ error: "Failed to delete blog post" });
        }
    }
    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
