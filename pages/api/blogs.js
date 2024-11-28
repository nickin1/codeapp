import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from "../../lib/authorization";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    console.log("Request method:", req.method);

    // Create new blog post
    if (req.method === 'POST') {
        console.log("Request body:", req.body);
        const { title, content, authorId, templateIds, tags } = req.body;

        // Authorization check
        const authResult = await authorizeRequest(req, authorId);
        console.log("Authorization result:", authResult);
        if (!authResult.authorized) {
            console.log("Authorization failed:", authResult.error);
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

            console.log("New blog created:", newBlog);

            res.status(201).json(newBlog);
        } catch (error) {
            console.error("Error creating blog post:", error);
            res.status(500).json({ error: "Failed to create blog post" });
        }
    }
    else {
        console.log("Invalid request method:", req.method);
        res.status(405).end(`Method Not Allowed`);
    }
}

// used chatGPT for prisma queries