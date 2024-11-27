import { PrismaClient } from '@prisma/client';
import { authorizeRequest } from '../../../lib/authorization';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    console.log('Query parameters:', req.query);
    console.log('ownedOnly value:', req.query.ownedOnly, 'type:', typeof req.query.ownedOnly);

    const { searchTerm, page = 1, limit = 10, ownedOnly, userId } = req.query;
    let authorizedUserId = null;

    const isOwnedOnlyTrue = ownedOnly === 'true';
    console.log('isOwnedOnlyTrue:', isOwnedOnlyTrue);

    if (isOwnedOnlyTrue) {
        console.log('Entering ownedOnly block');
        const authResult = await authorizeRequest(req, userId);
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error });
        }
        authorizedUserId = authResult.userId;
        console.log('userId after auth:', authorizedUserId);
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
            console.log('Final where clause:', where);

            const templates = await prisma.codeTemplate.findMany({
                where,
                skip,
                take,
                include: {
                    author: true,
                },
            });

            const totalTemplates = await prisma.codeTemplate.count({ where });

            console.log('templates:', templates);
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

// used chatGPT for prisma queries and general outline 