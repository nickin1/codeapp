import { PrismaClient } from '@prisma/client';
import { off } from 'process';
import { authorizeRequest } from '../../../lib/authorization';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { searchTerm, page = 1, limit = 10, sortBy = 'dateDesc', tags = '' } = req.query;

    if (req.method === 'GET') {
        try {
            const session = await getServerSession(req, res, authOptions);
            const userId = session?.user?.id;
            const isAdmin = session?.user?.isAdmin;

            const tagArray = tags ? tags.split(',') : [];

            const whereClause = {
                AND: [
                    {
                        OR: [
                            { title: { contains: searchTerm || '' } },
                            { content: { contains: searchTerm || '' } },
                            { tags: { contains: searchTerm || '' } },
                        ]
                    },
                    // Only apply hidden filter for non-admins
                    ...(!isAdmin ? [{
                        OR: [
                            { hidden: false },
                            { authorId: userId }
                        ]
                    }] : []),
                    ...(tagArray.length > 0 ? [{
                        tags: {
                            hasSome: tagArray
                        }
                    }] : [])
                ]
            };

            let blogPosts = await prisma.blogPost.findMany({
                where: whereClause,
                include: {
                    votes: true,
                    author: true,
                },
            });

            blogPosts = blogPosts.map(post => ({
                ...post,
                score: post.votes.reduce((acc, vote) => acc + vote.type, 0)
            }));

            // Apply sorting
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
            }

            const startIndex = (Number(page) - 1) * Number(limit);
            const endIndex = startIndex + Number(limit);
            const paginatedPosts = blogPosts.slice(startIndex, endIndex);

            return res.status(200).json({
                posts: paginatedPosts,
                currentPage: Number(page),
                totalPages: Math.ceil(blogPosts.length / Number(limit)),
                totalPosts: blogPosts.length
            });
        } catch (error) {
            console.error("Error occurred during search:", error);
            return res.status(500).json({ message: 'Error retrieving blog posts', error });
        }
    }
}
