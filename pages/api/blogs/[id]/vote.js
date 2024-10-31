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

    if (req.method === "POST" && req.url.endsWith("/vote")) {
        const {voteType} = req.body;

        try {
            const comment = await prisma.comment.findUnique({
                where: {
                    id: blogPostId,
                },
            });

            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }

            const updatedComment = await prisma.comment.update({
                where: {
                    id: comment.id,
                },
                data: {
                    upvotes: voteType === 'upvote' ? comment.upvotes + 1 : comment.upvotes,
                    downvotes: voteType === 'downvote' ? comment.downvotes + 1 : comment.downvotes,
                },
            });

            return res.status(200).json(updatedComment);
        } catch (error) {
            console.error("Error voting on comment:", error);
            res.status(500).json({error: "Failed to vote on comment"})
        }
    }
}