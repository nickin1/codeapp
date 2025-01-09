import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from "../../lib/authorization";

const prisma = new PrismaClient();

export default async function handler(req, res) {

    if (req.method === 'POST') {
        const { title, content, authorId, templateIds, tags } = req.body;

        const authResult = await authorizeRequest(req, authorId, res);
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error });
        }

        try {
            const newBlog = await prisma.blogPost.create({
                data: {
                    title,
                    content,
                    author: {
                        connect: { id: authorId }
                    },
                    templates: templateIds ? {
                        connect: templateIds.map(id => ({ id }))
                    } : undefined,
                    tags: tags
                },
            });

            res.status(201).json(newBlog);
        } catch (error) {
            console.error("Error creating blog post:", error);
            res.status(500).json({ error: "Failed to create blog post" });
        }
    }
    else {
        res.status(405).end(`Method Not Allowed`);
    }
}
