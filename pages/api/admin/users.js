import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth.config";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { searchTerm, page = 1, limit = 10, sortBy = 'createdAt' } = req.query;

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
                    { name: { contains: searchTerm || '', mode: 'insensitive' } },
                    { email: { contains: searchTerm || '', mode: 'insensitive' } },
                ],
            };

            const [users, totalCount] = await Promise.all([
                prisma.user.findMany({
                    where: whereClause,
                    skip,
                    take,
                    orderBy: {
                        [sortBy]: 'desc',
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        github_url: true,
                        isActivated: true,
                        isAdmin: true,
                        createdAt: true,
                        last_login: true,
                        _count: {
                            select: {
                                blogPosts: true,
                                comments: true,
                                templates: true,
                            }
                        }
                    }
                }),
                prisma.user.count({ where: whereClause })
            ]);

            return res.status(200).json({
                users,
                pagination: {
                    totalItems: totalCount,
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalCount / take),
                    pageSize: take,
                }
            });
        } catch (error) {
            console.error("Error retrieving users:", error);
            return res.status(500).json({ error: "Error retrieving users" });
        }
    }

    if (req.method === 'PATCH') {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.isAdmin) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const { userId, isActivated } = req.body;

        try {
            if (isActivated === false) {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { isAdmin: true }
                });

                if (user?.isAdmin) {
                    return res.status(400).json({ error: "Cannot deactivate admin users" });
                }
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    isActivated: isActivated !== undefined ? isActivated : undefined,
                }
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error("Error updating user:", error);
            return res.status(500).json({ error: "Error updating user" });
        }
    }

    res.status(405).end(`Method ${req.method} Not Allowed`);
} 