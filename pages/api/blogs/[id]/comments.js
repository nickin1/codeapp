import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from "../../../../lib/authorization";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { content, authorId, blogPostId, parentId } = req.body;

        // Authorization check
        const authResult = await authorizeRequest(req, authorId);
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error });
        }

        if (!content) {
            return res.status(400).json({ error: "content field empty" });
        }

        if (!blogPostId) {
            return res.status(400).json({ error: "Blog post ID is required" });
        }

        try {
            const newComment = await prisma.comment.create({
                data: {
                    content,
                    author: {
                        connect: { id: authorId }
                    },
                    blogPost: {
                        connect: { id: blogPostId }
                    },
                    parent: parentId ? {
                        connect: { id: parentId }
                    } : undefined
                },
                include: {
                    author: true,
                    blogPost: true,
                    parent: true,
                    children: true
                }
            });


            res.status(201).json(newComment);
        } catch (error) {
            console.error("Error creating comment:", error);
            res.status(500).json({ error: "Failed to create comment" });
        }
    }
    // Handle unsupported methods
    else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

// used chatGPT for prisma queries