import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from "../../../../lib/authorization";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;
    const { userId, type } = req.body; // type: 1 for upvote, -1 for downvote

    if (req.method === 'POST') {

        // Authorization check
        const authResult = await authorizeRequest(req, userId);
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



// export default async function handler(req, res) {
//     // REMEMBER: req.query for GET, and req.body for POST/PUT/DELETE
//     const { id } = req.query;

//     const blogPostId = Number(id);

//     if (!blogPostId) {
//         return res.status(400).json({ error: "Missing blog post ID" });
//     }

//     if (req.method !== "POST") {
//         return res.status(405).json({ error: "Method not allowed" });
//     }

//     if (req.method === "POST" && req.url.endsWith("/vote")) {
//         const { voteType } = req.body;

//         try {
//             const comment = await prisma.comment.findUnique({
//                 where: {
//                     id: blogPostId,
//                 },
//             });

//             if (!comment) {
//                 return res.status(404).json({ error: "Comment not found" });
//             }

//             const updatedComment = await prisma.comment.update({
//                 where: {
//                     id: comment.id,
//                 },
//                 data: {
//                     upvotes: voteType === 'upvote' ? comment.upvotes + 1 : comment.upvotes,
//                     downvotes: voteType === 'downvote' ? comment.downvotes + 1 : comment.downvotes,
//                 },
//             });

//             return res.status(200).json(updatedComment);
//         } catch (error) {
//             console.error("Error voting on comment:", error);
//             res.status(500).json({ error: "Failed to vote on comment" })
//         }
//     }
// }