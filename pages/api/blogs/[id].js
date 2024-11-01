import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;

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
            if (error.code === "P2025") {
                res.status(404).json({ error: "Blog post not found" });
            } else {
                res.status(500).json({ error: "Failed to retrieve blog post" });
            }
        }
    }
    else if (req.method === "PUT") {
        const { title, content, templateIds, tagIds } = req.body;

        try {
            // const blogPost = await prisma.blogPost.findUnique({
            //     where: {
            //         id,
            //     },
            // });

            // if (!blogPost) {
            //     return res.status(404).json({ error: "Blog post not found" });
            // }

            // await prisma.blogPost.delete({
            //     where: {
            //         id,
            //     },
            // });

            const updatedBlogPost = await prisma.blogPost.update({
                where: {
                    id
                },
                data: {
                    title,
                    content,
                    templates: templateIds ? {
                        set: templateIds.map(id => ({ id })) // Sets templates to new list
                    } : undefined,
                    tags: tagIds ? {
                        set: tagIds.map(id => ({ id })) // Sets tags to new list
                    } : undefined
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
            if (error.code === "P2025") {
                res.status(404).json({ error: "Blog post not found" });
            } else {
                res.status(500).json({ error: "Failed to update blog post" });
            }
        }
    }
    else if (req.method === "DELETE") {
        try {
            const deletedBlogPost = await prisma.blogPost.delete({
                where: { id }
            });

            return res.status(200).json(deletedBlogPost);
        } catch (error) {
            if (error.code === "P2025") {
                res.status(404).json({ error: "Blog post not found" });
            } else {
                res.status(500).json({ error: "Failed to delete blog post" });
            }
        }
    }
    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}