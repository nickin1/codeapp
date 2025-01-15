import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth.config";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { searchTerm, page = 1, limit = 10 } = req.query;

    if (req.method === 'GET') {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.isAdmin) {
            return res.status(403).json({ error: "Unauthorized access" });
        }
        try {
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);

            const whereClause = {
                OR: [
                    { language: { contains: searchTerm || '', mode: 'insensitive' } },
                    { ipAddress: { contains: searchTerm || '', mode: 'insensitive' } },
                    {
                        user: {
                            OR: [
                                { name: { contains: searchTerm || '', mode: 'insensitive' } },
                                { email: { contains: searchTerm || '', mode: 'insensitive' } },
                            ]
                        }
                    }
                ],
            };


            const [logs, totalCount] = await Promise.all([
                prisma.ExecutionLog.findMany({
                    where: whereClause,
                    skip,
                    take,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                                image: true,
                            }
                        }
                    }
                }),
                prisma.ExecutionLog.count({ where: whereClause })
            ]);

            return res.status(200).json({
                logs,
                pagination: {
                    totalItems: totalCount,
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalCount / take),
                    pageSize: take,
                }
            });
        } catch (error) {
            console.error("Error retrieving execution logs:", error);
            return res.status(500).json({ error: "Error retrieving execution logs" });
        }
    } else if (req.method === 'DELETE') {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.isAdmin) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        try {
            await prisma.executionLog.deleteMany({});
            return res.status(200).json({ message: "All logs cleared successfully" });
        } catch (error) {
            console.error("Error clearing execution logs:", error);
            return res.status(500).json({ error: "Error clearing execution logs" });
        }
    } else {
        res.status(405).end(`Method Not Allowed`);
    }
} 