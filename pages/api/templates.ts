import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

interface CreateTemplateBody {
    title: string;
    description: string;
    code: string;
    language: string;
    tags: string[];
    authorId: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    if (req.method === 'POST') {
        const { title, description, code, language, tags } = req.body as CreateTemplateBody;

        // Get session using NextAuth
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user) {
            return res.status(403).json({ error: "Not authenticated" });
        }

        try {
            const newTemplate = await prisma.codeTemplate.create({
                data: {
                    title,
                    description,
                    code,
                    language,
                    tags: tags.join(','),
                    author: {
                        connect: { id: session.user.id }
                    }
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true
                        }
                    },
                    blogPosts: true
                }
            });

            res.status(201).json(newTemplate);
        } catch (error) {
            console.error("Error creating template:", error);
            console.error("Error details:", {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            res.status(500).json({ error: "Failed to create template" });
        }
    } else {
        res.status(405).end(`Method Not Allowed`);
    }
} 