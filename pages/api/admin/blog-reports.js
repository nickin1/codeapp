import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth.config";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { page = 1, limit = 10 } = req.query;

    if (req.method === 'GET') {
        // Get session using NextAuth
        const session = await getServerSession(req, res, authOptions);

        // Check if user is authenticated and is admin
        if (!session?.user?.isAdmin) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const skip = (page - 1) * limit;
        const takeLimit = Number(limit);

        try {
            const totalBlogPosts = await prisma.blogPost.count({
                where: {
                    report: {
                        some: {} // Only count posts with reports
                    }
                }
            });

            const totalPages = Math.ceil(totalBlogPosts / takeLimit);

            const blogPosts = await prisma.blogPost.findMany({
                where: {
                    report: {
                        some: {} // Only get posts with reports
                    }
                },
                include: {
                    report: {
                        include: {
                            reporter: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    },
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    report: { _count: 'desc' }
                },
                skip,
                take: takeLimit,
            });

            return res.status(200).json({
                items: blogPosts,
                pagination: {
                    totalItems: totalBlogPosts,
                    totalPages,
                    currentPage: Number(page),
                    pageSize: takeLimit,
                },
            });
        } catch (error) {
            console.error("Error retrieving reported blog posts:", error);
            res.status(500).json({ error: "Error retrieving reported blog posts" });
        }
    } else {
        res.status(405).end(`Method Not Allowed`);
    }
} 