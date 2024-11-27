import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from "../../lib/authorization";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    console.log('Incoming request:', { method: req.method, body: req.body });

    if (req.method === 'POST') {
        const { title, description, code, language, tags, authorId } = req.body;
        console.log('Parsed request body:', { title, description, language, tags, authorId });

        // Authorization check
        console.log('Checking authorization for authorId:', authorId);
        const authResult = await authorizeRequest(req, authorId);
        console.log('Authorization result:', authResult);

        if (!authResult.authorized) {
            console.log('Authorization failed:', authResult.error);
            return res.status(403).json({ error: authResult.error });
        }

        try {
            console.log('Attempting to create template in database...');
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
            });
            console.log('Template created successfully:', newTemplate);
            res.status(201).json(newTemplate);
        } catch (error) {
            console.error("Error creating template:", error);
            console.error("Error details:", {
                message: error.message,
                stack: error.stack
            });
            res.status(500).json({ error: "Failed to create template" });
        }
    }
    else {
        console.log('Method not allowed:', req.method);
        res.status(405).end(`Method Not Allowed`);
    }
}

// used chatGPT for prisma queries