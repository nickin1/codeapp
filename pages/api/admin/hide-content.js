import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { contentId, contentType, hide } = req.body;

    if (req.method === 'POST') {
        // Get session using NextAuth
        const session = await getServerSession(req, res, authOptions);

        // Check if user is authenticated and is admin
        if (!session?.user?.isAdmin) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        try {
            let updatedContent;

            if (contentType === 'blogPost') {
                updatedContent = await prisma.blogPost.update({
                    where: { id: contentId },
                    data: {
                        hidden: hide,
                        updatedAt: new Date() // Add timestamp for when content was hidden/unhidden
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                });
            } else if (contentType === 'comment') {
                updatedContent = await prisma.comment.update({
                    where: { id: contentId },
                    data: {
                        hidden: hide,
                        updatedAt: new Date()
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                });
            } else {
                return res.status(400).json({ error: "Invalid content type" });
            }

            return res.status(200).json({
                message: `Content ${hide ? 'hidden' : 'unhidden'} successfully`,
                updatedContent
            });
        } catch (error) {
            console.error("Error updating content visibility:", error);
            res.status(500).json({ error: "Error updating content visibility" });
        }
    } else {
        res.status(405).end(`Method Not Allowed`);
    }
}
