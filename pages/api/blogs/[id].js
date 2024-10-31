import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const {id} = req.body;

    id = Number(id);

    if (!id) {
        return res.status(400).json({ error: "Missing ID" });
    }

    if (req.method === "GET") {
        try {
            const blogPost = await prisma.blogPost.findUnique({
                where: {
                    id,
                },
                include: {
                    author: true,
                    comments: true,
                    templates: true,
                    tags: true,
                    report: true,
                },
            });
        
            if (!blogPost) {
                return res.status(404).json({ error: "Blog post not found" });
            }
            return res.status(200).json(blogPost);
        } catch (error) {
            console.error("Error retrieving blog post:", error);
            res.status(500).json({error: 'Failed to retrieve blog post'});
        }
    }
    else if (req.method === "PUT") {
        const {title, content, authorId, templates, tags} = req.body;
        try {
            const blogPost = await prisma.blogPost.findUnique({
                where: {
                    id,
                },
            });
        
            if (!blogPost) {
                return res.status(404).json({ error: "Blog post not found" });
            }

            await prisma.blogPost.delete({
                where: {
                    id,
                },
            });

            const updatedBlogPost = await prisma.blogPost.update({
                where: {
                    id
                },
                data: {
                    title: title || blogPost.title, // set new value if provided, otehrwise fall back
                    content: content || blogPost.content,
                    authorId: authorId || blogPost.authorId,
                    templates: templates ? { set: templates } : undefined, // only set if provided, otherwise, still undefined
                    tags: tags ? { set: tags } : undefined
                },
                include: {
                    author: true,
                    comments: true,
                    templates: true,
                    tags: true,
                    report: true,
                },
            })

            return res.status(200).json(updatedBlogPost);
        } catch (error) {
            console.error("Error updating blog post:", error);
            res.status(500).json({error: 'Failed to updating blog post'});
        }
    }
    else if (req.method === "DELETE") {
        try {
            const blogPost = await prisma.blogPost.findUnique({
                where: {
                    id,
                },
            });
        
            if (!blogPost) {
                return res.status(404).json({ error: "Blog post not found" });
            }

            awat

            return res.status(200).json(blogPost);
        } catch (error) {
            console.error("Error deleting blog post:", error);
            res.status(500).json({error: 'Failed to delete blog post'});
        }
    }
    else {
        return res.status(405).json({error: 'Method not allowed'});
    }
}