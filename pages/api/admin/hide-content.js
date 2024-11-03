import { PrismaClient } from '@prisma/client';
import { authorizeRequest } from '../../../lib/authorization';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { contentId, contentType, hide } = req.body;

    if (req.method === 'POST') {
        // Authorization check (admin only)
        const authResult = await authorizeRequest(req);
        if (!authResult.authorized || !authResult.isAdmin) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        try {
            let updatedContent;

            if (contentType === 'blogPost') {
                updatedContent = await prisma.blogPost.update({
                    where: { id: contentId },
                    data: { hidden: hide },
                });
            } else if (contentType === 'comment') {
                updatedContent = await prisma.comment.update({
                    where: { id: contentId },
                    data: { hidden: hide },
                });
            } else {
                return res.status(400).json({ error: "Invalid content type" });
            }

            return res.status(200).json({ message: `Content ${hide ? 'hidden' : 'unhidden'} successfully`, updatedContent });
        } catch (error) {
            console.error("Error updating content visibility:", error);
            res.status(500).json({ error: "Error updating content visibility" });
        }
    } else {
        res.status(405).end(`Method Not Allowed`);
    }
}

// partially adapted from chatGPT