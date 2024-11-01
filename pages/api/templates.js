import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Create new template
    if (req.method === 'POST') {
        const { title, description, code, language, tags, authorId } = req.body;

        try {
            const newTemplate = await prisma.codeTemplate.create({
                data: {
                    title,
                    description,
                    code,
                    language,
                    tags,
                    author: {
                        connect: { id: authorId }
                    }
                },
                include: {
                    author: true,
                    blogPosts: true
                }
            })
            res.status(201).json(newTemplate);
        } catch (error) {
            console.error("Error creating template:", error);
            res.status(500).json({ error: "Failed to create template" });
        }
    }

    // List templates
    else if (req.method === 'GET') {
        try {
            const templates = await prisma.codeTemplate.findMany({
                include: {
                    author: true,
                    blogPosts: true
                }
            })

            res.status(200).json(templates);
        } catch (error) {
            console.error("Error retrieving templates:", error);
            res.status(500).json({ error: "Failed to retrieve templates" });
        }
    }
}