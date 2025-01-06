import { PrismaClient } from '@prisma/client';
import { authorizeRequest } from '../../../../lib/authorization';

const prisma = new PrismaClient();

export default async function handler(req, res) {

    const { id } = req.query;

    if (req.method === 'POST') {
        const { userId, reason, additionalExplanation } = req.body;

        if (!reason || !additionalExplanation) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        // Authorization check
        const authResult = await authorizeRequest(req, userId, res);
        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error });
        }

        try {
            const report = await prisma.blogPostReport.create({
                data: {
                    reason,
                    reporter: {
                        connect: { id: userId }, // Connects to the user making the report
                    },
                    blogPost: {
                        connect: { id: id }, // Connects to the blog post being reported
                    },
                    additionalExplanation,
                },
            });
            return res.status(201).json(report);
        } catch (error) {
            console.error("Error occurred:", error);
            return res.status(500).json({ message: 'Error creating report' });
        }
    } else if (method === 'GET') {
        try {
            const reports = await prisma.blogPostReport.findMany({
                where: { blogPostId: id },
            });
            return res.status(200).json(reports);
        } catch (error) {
            return res.status(500).json({ message: 'Error retrieving reports' });
        }
    } else {
        res.status(405).end(`Method not Allowed`);
    }
}


//used chatGPT for prisma queries