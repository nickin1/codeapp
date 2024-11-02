import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from "../../lib/authorization";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Create new blog post
    if (req.method === 'POST') {
        const { title, content, authorId, templateIds, tagIds } = req.body;

        // Authorization check
        const authResult = await authorizeRequest(req, authorId); // Check if the user is authorized
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error }); // Return 403 if not authorized
        }

        try {
            // Note that Prisma automatically fetches the corresponding author name because of the schema relations!
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
                    tags: tagIds ? {
                        connect: tagIds.map(id => ({ id }))
                    } : undefined
                },
            })
            res.status(201).json(newBlog);
        } catch (error) {
            console.error("Error creating blog post:", error);
            res.status(500).json({ error: "Failed to create blog post" });
        }
    }

    // List blog posts
    else if (req.method === 'GET') {
        try {
            // findMany to retrieve all blog posts
            // use await to ensure previous async operations complete!
            const posts = await prisma.blogPost.findMany({
                // we are ensuring we include the fields that corresponds to other schema relation tables
                include: {
                    author: true,
                    comments: true,
                    templates: true,
                    tags: true,
                    report: true
                }
            })

            res.status(200).json(posts);
        } catch (error) {
            console.error("Error retrieving blog posts:", error);
            res.status(500).json({ error: "Failed to retrieve blog posts" });
        }
    }
}