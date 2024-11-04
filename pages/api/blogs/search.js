import { PrismaClient } from '@prisma/client';
import { off } from 'process';
import { authorizeRequest } from '../../../lib/authorization';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { searchTerm, page = 1, limit = 10 } = req.query;

    if (req.method === 'GET') {
        try {

            const authResult = await authorizeRequest(req);

            const userId = authResult.userId;

            let blogPosts;

            if (authResult.isAdmin) {
                // Retrieve all relevant blog posts
                blogPosts = await prisma.blogPost.findMany({
                    where: {
                        OR: [
                            { title: { contains: searchTerm || '' } },
                            { content: { contains: searchTerm || '' } },
                            { tags: { contains: searchTerm || '' } },
                        ],
                    },
                    include: {
                        votes: true, // Include votes for each blog post
                    },
                });
            }
            else {
                // Retrieve relevant blog posts
                blogPosts = await prisma.blogPost.findMany({
                    where: {
                        OR: [
                            {
                                AND: [
                                    { hidden: false }, // Show only non-hidden posts
                                    {
                                        OR: [
                                            { title: { contains: searchTerm || '' } },
                                            { content: { contains: searchTerm || '' } },
                                            { tags: { contains: searchTerm || '' } },
                                        ],
                                    },
                                ],
                            },
                            userId ? {
                                AND: [
                                    { authorId: userId }, // Allow user to see their own posts
                                    {
                                        OR: [
                                            { title: { contains: searchTerm || '' } },
                                            { content: { contains: searchTerm || '' } },
                                            { tags: { contains: searchTerm || '' } },
                                        ],
                                    },
                                ],
                            } : null, // Do not include the user-specific clause if userId is null
                        ].filter(Boolean),
                    },
                    include: {
                        votes: true, // Include votes for each blog post
                    },
                });
            }

            // Calculate scores for all blog posts
            const resultsWithScores = blogPosts.map(blogPost => {
                const score = blogPost.votes.reduce((acc, vote) => acc + vote.type, 0);
                return { ...blogPost, score };
            });

            // Sort by score descending
            resultsWithScores.sort((a, b) => b.score - a.score);

            // Paginate the results
            const paginatedResults = resultsWithScores.slice((page - 1) * limit, page * limit);

            return res.status(200).json({
                totalPosts: resultsWithScores.length, // Total number of posts found
                currentPage: page,
                totalPages: Math.ceil(resultsWithScores.length / limit),
                posts: paginatedResults,
            });
        } catch (error) {
            console.error("Error occured during search:", error);
            return res.status(500).json({ message: 'Error retrieving blog posts', error });
        }
    } else {
        res.status(405).end(`Method not Allowed`);
    }
}

// used chatGPT for prisma queries