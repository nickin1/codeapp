import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from "../../../lib/authorization";

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


        // Fetch the template first
        const template = await prisma.codeTemplate.findUnique({
            where: { id },
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        // Authorization check
        const authResult = await authorizeRequest(req, template.authorId, res);
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error });
        }

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
                    tags: tags.join(','),
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

        // Fetch the template first
        const template = await prisma.codeTemplate.findUnique({
            where: { id },
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }


        // Authorization check
        const authResult = await authorizeRequest(req, template.authorId, res);
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error });
        }

        try {
            const deletedTemplate = await prisma.codeTemplate.delete({
                where: { id }
            });

            return res.status(200).json(deletedTemplate);
        } catch (error) {
            console.error(`Error deleting template ${id}:`, error);
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

