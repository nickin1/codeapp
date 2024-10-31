import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    // REMEMBER: req.query for GET, and req.body for POST/PUT/DELETE
    const {id} = req.query;

    const blogPostId = Number(id);

    if (!blogPostId) {
        return res.status(400).json({ error: "Missing blog post ID" });
    }

    if (req.method !== "POST") {
        return res.status(405).json({error: "Method not allowed"});
    }

    if (req.method === "POST" && req.url.endsWith("/comments")) {
        const { content, authorId } = req.body;
        
        if (!content || !authorId) {
            return res.status(400).json({error: "Content and author ID are required"});
        }

        try {
            const comment = prisma.comment.create({
                data: {
                    content, // pull in all the existing content for the blog post
                    author: {connect: {id: authorId}},
                    blogPost: {connect: {id:blogPostId}}
                }
            })
        } catch (error) {
            console.error("Error adding comment:", error);
            res.status(500).json({error: "Failed to add comment"});
        }
    }
}