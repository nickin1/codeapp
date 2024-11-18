import { PrismaClient } from '@prisma/client';
import { authorizeRequest } from '../../../lib/authorization';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { page = 1, limit = 10 } = req.query;

    if (req.method === 'GET') {
        // Authorization check (admin only)
        const authResult = await authorizeRequest(req);
        if (!authResult.authorized || !authResult.isAdmin) {
            console.log("Unauthorized access", authResult.isAdmin);
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const skip = (page - 1) * limit;
        const takeLimit = Number(limit);

        try {
            // Get total count for pagination
            const totalBlogPosts = await prisma.blogPost.count();

            // Calculate total pages
            const totalPages = Math.ceil(totalBlogPosts / takeLimit);

            // Retrieve paginated blog posts with report count
            const blogPosts = await prisma.blogPost.findMany({
                include: {
                    report: true,
                },
                orderBy: {
                    report: { _count: 'desc' },
                },
                skip,
                take: takeLimit,
            });

            return res.status(200).json({
                items: blogPosts,
                pagination: {
                    totalItems: totalBlogPosts,
                    totalPages: totalPages,
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