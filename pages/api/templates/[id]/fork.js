import { PrismaClient } from '@prisma/client';
import { authorizeRequest } from '../../../../lib/authorization';

const prisma = new PrismaClient();


export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'POST') {
        const { userId, newTitle, newDescription, newCode, newLanguage, newTags } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Authorization check
        const authResult = await authorizeRequest(req, userId, res);
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error });
        }

        try {
            // Find the existing template
            const originalTemplate = await prisma.codeTemplate.findUnique({
                where: { id },
            });

            if (!originalTemplate) {
                return res.status(404).json({ message: 'Template not found' });
            }

            const forkedTemplate = await prisma.codeTemplate.create({
                data: {
                    title: newTitle || originalTemplate.title,
                    description: newDescription || originalTemplate.description,
                    code: newCode || originalTemplate.code,
                    language: newLanguage || originalTemplate.language,
                    tags: newTags || originalTemplate.tags,
                    authorId: userId, // Set the author to the user who forks
                    forked: true,
                },
            });

            return res.status(201).json({ newTemplateId: forkedTemplate.id });
        } catch (error) {
            console.error('Error forking template:', error);
            return res.status(500).json({ message: 'Error forking the template' });
        }
    } else {
        return res.status(405).end(`Method not Allowed`);
    }
}