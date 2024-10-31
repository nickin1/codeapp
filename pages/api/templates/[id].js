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
            const template = await prisma.codeTemplate.findUnique({
                where: {
                    id,
                },
                include: {
                    author: true,
                    blogPosts: true,
                },
            });
        
            if (!blogPost) {
                return res.status(404).json({ error: "Template not found" });
            }
            return res.status(200).json(template);
        } catch (error) {
            console.error("Error retrieving template:", error);
            res.status(500).json({error: 'Failed to retrieve template'});
        }
    }
    else if (req.method === "PUT") {
        const {title, description, code, language, authorId, blogPosts} = req.body;
        try {
            const template = await prisma.codeTemplate.findUnique({
                where: {
                    id,
                },
            });
        
            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }

            await prisma.codeTemplate.delete({
                where: {
                    id,
                },
            });

            const updatedTemplate = await prisma.codeTemplate.update({
                where: {
                    id
                },
                data: {
                    title: title || template.title, // set new value if provided, otehrwise fall back
                    description: description || template.description,
                    code: code || template.code,
                    language: language || template.language,
                    authorId: authorId || template.authorId,
                    blogPosts: blogPosts ? { set: blogPosts } : undefined, // only set if provided, otherwise, still undefined
                },
                include: {
                    author: true,
                    blogPosts: true,
                },
            })

            return res.status(200).json(updatedTemplate);
        } catch (error) {
            console.error("Error updating template:", error);
            res.status(500).json({error: 'Failed to updating template'});
        }
    }
    else if (req.method === "DELETE") {
        try {
            const template = await prisma.codeTemplate.findUnique({
                where: {
                    id,
                },
            });
        
            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }

            awat

            return res.status(200).json(template);
        } catch (error) {
            console.error("Error deleting template:", error);
            res.status(500).json({error: 'Failed to delete template'});
        }
    }
    else {
        return res.status(405).json({error: 'Method not allowed'});
    }
}