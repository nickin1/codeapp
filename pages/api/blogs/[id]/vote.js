import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from "../../../../lib/authorization";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;
    const { userId, type } = req.body; // type: 1 for upvote, -1 for downvote

    if (req.method === 'POST') {

        // Authorization check
        const authResult = await authorizeRequest(req, userId, res);
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error });
        }

        try {
            const existingVote = await prisma.userVote.findFirst({
                where: { userId, blogPostId: id }
            });

            if (existingVote) {
                if (existingVote.type === type) {
                    // If the same vote type is given, remove the vote (toggle off)
                    await prisma.userVote.delete({
                        where: { id: existingVote.id }
                    });
                    res.status(200).json({ message: "Vote removed" });
                } else {
                    // Update the vote type if it's different
                    const updatedVote = await prisma.userVote.update({
                        where: { id: existingVote.id },
                        data: { type }
                    });
                    res.status(200).json(updatedVote);
                }
            } else {
                // Create a new vote
                const newVote = await prisma.userVote.create({
                    data: {
                        user: { connect: { id: userId } }, // Connect the user
                        blogPost: { connect: { id } }, // Connect the blog post
                        type
                    }
                });
                res.status(201).json(newVote);
            }
        } catch (error) {
            console.error("Error voting on blog post:", error);
            res.status(500).json({ error: "Failed to process vote" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

// used chatGPT for prisma queries