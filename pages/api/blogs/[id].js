import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from '../../../lib/authorization';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === "GET") {
        try {

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

            const authResult = await authorizeRequest(req, blogPost.authorId);

            // dont show if hidden
            if (blogPost.hidden && !authResult.authorized) {
                return res.status(404).json({ error: "Blog post unavailable" });
            }

            // Filter comments based on user's authorization level
            const filteredComments = blogPost.comments.filter(comment => {
                if (authResult.isAdmin || comment.authorId === authResult.userId) {
                    return true; // Show if user is admin or the author of the comment
                }
                return !comment.hidden; // Show only non-hidden comments otherwise
            });

            // Create a response object without the original comments
            const responseBlogPost = {
                ...blogPost,
                comments: filteredComments, // Replace original comments with filtered comments
            };

            return res.status(200).json(responseBlogPost);
        } catch (error) {
            console.error("Error occured when retrieving blog post:", error);
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
            // const blogPost = await prisma.blogPost.findUnique({
            //     where: {
            //         id,
            //     },
            // });

            // if (!blogPost) {
            //     return res.status(404).json({ error: "Blog post not found" });
            // }

            // await prisma.blogPost.delete({
            //     where: {
            //         id,
            //     },
            // });


            const blogPost = await prisma.blogPost.findUnique({
                where: { id },
            });

            if (!blogPost) {
                return res.status(404).json({ error: "Blog post not found" });
            }

            // Authorization check
            const authResult = await authorizeRequest(req, blogPost.authorId);
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
                        set: templateIds.map(id => ({ id })) // Sets templates to new list
                    } : undefined,
                    tags: tags ? tags : undefined
                },
                include: {
                    author: true,
                    comments: true,
                    templates: true,
                    report: true,
                },
            })

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
            });

            if (!blogPost) {
                return res.status(404).json({ error: "Blog post not found" });
            }

            // Authorization check
            const authResult = await authorizeRequest(req, blogPost.authorId);
            if (!authResult.authorized) {
                return res.status(403).json({ error: authResult.error });
            }

            const deletedBlogPost = await prisma.blogPost.delete({
                where: { id }
            });

            return res.status(200).json(deletedBlogPost);
        } catch (error) {
            if (error.code === "P2025") {
                res.status(404).json({ error: "Blog post not found" });
            } else {
                res.status(500).json({ error: "Failed to delete blog post" });
            }
        }
    }
    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

// used chatGPT for prisma queries and general code structure