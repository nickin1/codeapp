import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export default async function handler(req, res) {

    const { searchTerm, page = 1, limit = 10, ownedOnly } = req.query;
    let authorizedUserId = null;

    const isOwnedOnlyTrue = ownedOnly === 'true';

    if (isOwnedOnlyTrue) {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user) {
            return res.status(403).json({ error: "Not authenticated" });
        }
        authorizedUserId = session.user.id;
    }

    if (req.method === 'GET') {
        try {
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);

            const baseSearchConditions = [
                { title: { contains: searchTerm || '' } },
                { description: { contains: searchTerm || '' } },
                { tags: { contains: searchTerm || '' } },
                { code: { contains: searchTerm || '' } },
            ];

            const where = {
                OR: baseSearchConditions,
                ...(authorizedUserId && isOwnedOnlyTrue && { authorId: authorizedUserId })
            };

            const templates = await prisma.codeTemplate.findMany({
                where,
                skip,
                take,
                include: {
                    author: true,
                    blogPosts: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                },
            });

            const totalTemplates = await prisma.codeTemplate.count({ where });

            return res.status(200).json({
                totalTemplates,
                currentPage: Number(page),
                totalPages: Math.ceil(totalTemplates / take),
                templates,
            });
        } catch (error) {
            console.error("Error occurred retrieving templates:", error);
            return res.status(500).json({ message: 'Error retrieving templates' });
        }
    } else {
        res.status(405).end(`Method Not Allowed`);
    }
}
