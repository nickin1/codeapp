import { PrismaClient } from '@prisma/client';
import { authorizeRequest } from '../../../lib/authorization';

const prisma = new PrismaClient();

export default async function handler(req, res) {

    const { searchTerm, page = 1, limit = 10 } = req.query;
    const { userId } = req.body;

    if (req.method === 'POST') {

        // Authorization check
        const authResult = await authorizeRequest(req, userId);
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error });
        }

        try {
            const skip = (page - 1) * limit;

            const take = Number(limit);

            const templates = await prisma.codeTemplate.findMany({
                where: {
                    authorId: userId,
                    OR: [
                        {
                            title: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            description: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            tags: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            code: {
                                contains: searchTerm || '',
                            },
                        },
                    ],
                },
                skip: skip,
                take: take,
            });

            const totalTemplates = await prisma.codeTemplate.count({
                where: {
                    authorId: userId,
                    OR: [
                        {
                            title: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            description: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            tags: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            code: {
                                contains: searchTerm || '',
                            },
                        },
                    ],
                },
            });

            return res.status(200).json({
                totalTemplates,
                currentPage: page,
                totalPages: Math.ceil(totalTemplates / limit),
                templates,
            });
        } catch (error) {
            console.error("Error occured retrieving templates:", error);
            return res.status(500).json({ message: 'Error retrieving templates' });
        }
    }
    else if (req.method === 'GET') {
        try {
            const skip = (page - 1) * limit;

            const take = Number(limit);

            const templates = await prisma.codeTemplate.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            description: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            tags: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            code: {
                                contains: searchTerm || '',
                            },
                        },
                    ],
                },
                skip: skip,
                take: take,
            });

            const totalTemplates = await prisma.codeTemplate.count({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            description: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            tags: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            code: {
                                contains: searchTerm || '',
                            },
                        },
                    ],
                },
            });

            return res.status(200).json({
                totalTemplates,
                currentPage: page,
                totalPages: Math.ceil(totalTemplates / take),
                templates,
            });
        } catch (error) {
            console.error("Error occured retrieving templates:", error);
            return res.status(500).json({ message: 'Error retrieving templates' });
        }
    }
    else {
        res.status(405).end(`Method Not Allowed`);
    }

}
