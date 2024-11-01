import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;

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

            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }
            return res.status(200).json(template);
        } catch (error) {
            console.error("Error retrieving template:", error);
            res.status(500).json({ error: 'Failed to retrieve template' });
        }
    }
    else if (req.method === "PUT") {
        const { title, description, code, language, tags } = req.body;
        try {
            const updatedTemplate = await prisma.codeTemplate.update({
                where: {
                    id
                },
                data: {
                    title,
                    description,
                    code,
                    language,
                    tags
                },
                include: {
                    author: true,
                    blogPosts: true
                }
            });

            return res.status(200).json(updatedTemplate);
        } catch (error) {
            console.error("Error updating code template:", error);
            if (error.code === 'P2025') {
                res.status(404).json({ error: "Template not found" });
            } else {
                res.status(500).json({ error: "Failed to update code template" });
            }
        }
    }
    else if (req.method === "DELETE") {
        try {

            const deletedTemplate = await prisma.codeTemplate.delete({
                where: { id }
            });

            return res.status(200).json(deletedTemplate);
        } catch (error) {
            if (error.code === 'P2025') {
                res.status(404).json({ error: "Template not found" });
            } else {
                res.status(500).json({ error: "Failed to delete code template" });
            }
        }
    }
    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}