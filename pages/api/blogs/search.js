import { PrismaClient } from '@prisma/client';
import { off } from 'process';
import { authorizeRequest } from '../../../lib/authorization';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { searchTerm, page = 1, limit = 10, sortBy = 'dateDesc' } = req.query;

    if (req.method === 'GET') {
        try {
            const authResult = await authorizeRequest(req);
            const userId = authResult.userId;

            let blogPosts = await prisma.blogPost.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            content: {
                                contains: searchTerm || '',
                            },
                        },
                        {
                            tags: {
                                contains: searchTerm || '',
                            },
                        },
                    ],
                },
                include: {
                    votes: true,
                    author: true,
                },
            });

            // Calculate scores once for all blog posts
            blogPosts = blogPosts.map(post => ({
                ...post,
                score: post.votes.reduce((acc, vote) => acc + vote.type, 0)
            }));

            // Sort based on the sortBy parameter
            switch (sortBy) {
                case 'dateDesc':
                    blogPosts.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());
                    break;
                case 'dateAsc':
                    blogPosts.sort((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf());
                    break;
                case 'scoreDesc':
                    blogPosts.sort((a, b) => b.score - a.score);
                    break;
                case 'scoreAsc':
                    blogPosts.sort((a, b) => a.score - b.score);
                    break;
                default:
                    blogPosts.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());
            }

            // Paginate the results
            const paginatedResults = blogPosts.slice((page - 1) * limit, page * limit);

            return res.status(200).json({
                totalPosts: blogPosts.length,
                currentPage: Number(page),
                totalPages: Math.ceil(blogPosts.length / limit),
                posts: paginatedResults,
            });
        } catch (error) {
            console.error("Error occurred during search:", error);
            return res.status(500).json({ message: 'Error retrieving blog posts', error });
        }
    } else {
        res.status(405).end(`Method not Allowed`);
    }
}

// used chatGPT for prisma queries