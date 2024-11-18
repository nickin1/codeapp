import { PrismaClient } from '@prisma/client';
import { authorizeRequest } from '../../../lib/authorization';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { page = 1, limit = 10 } = req.query;

    if (req.method === 'GET') {
        // Authorization check (admin only)
        const authResult = await authorizeRequest(req);
        if (!authResult.authorized || !authResult.isAdmin) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const skip = (page - 1) * limit;
        const takeLimit = Number(limit);

        try {
            // Get total count for pagination
            const totalComments = await prisma.comment.count();

            // Calculate total pages
            const totalPages = Math.ceil(totalComments / takeLimit);

            // Retrieve paginated comments with report count
            const comments = await prisma.comment.findMany({
                include: {
                    reports: true,
                },
                orderBy: {
                    reports: { _count: 'desc' },
                },
                skip,
                take: takeLimit,
            });

            return res.status(200).json({
                items: comments,
                pagination: {
                    totalItems: totalComments,
                    totalPages: totalPages,
                    currentPage: Number(page),
                    pageSize: takeLimit,
                },
            });
        } catch (error) {
            console.error("Error retrieving reported comments:", error);
            res.status(500).json({ error: "Error retrieving reported comments" });
        }
    } else {
        res.status(405).end(`Method Not Allowed`);
    }
} 