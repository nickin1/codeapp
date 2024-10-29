import { PrismaClient } from "@prisma/client";
import { generateRefreshToken, generateAccessToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Create new blog post
    if (req.method === 'POST') {
        const { title, content, authorId, templates, tags} = req.body;

        try {
            // Note that Prisma autmaotically fetches the corresponding author name because of the schema   relations!
            const newBlog = prisma.BlogPost.create({
                data: {
                    title: title, 
                    content: content, 
                    authorId: authorId,
                    comments: {create:[]},
                    report: {create:[]},
                    templates: CodeTemplate?.map((templateId) => ({
                        connect: {id: templateId} // connect any existing templates
                    })),
                    tags: Tags?.map((tagId) => ({
                        connect: {id: templateId} // connect any existing tags
                    }))
                }
            })
            res.status(201).json(newBlog);
        } catch (error) {
            console.error("Error creating blog post:", error);
            res.status(500).json({error: "Failed to create blog post"});
        }
    }

    // List blog posts
    else if (req.method === 'GET') {
        try {
            // findMany to retrieve all blog posts
            const posts = await prisma.blogPost.findMany({
                // we are ensuring we include the fields that corresponds to other schema relation tables
                include: {
                    author: true,
                    comments: true,
                    templates: true,
                    tags: true,
                    report: true
                }
            })

            res.status(200).json(posts);
        } catch(error) {
            console.error("Error retrieving blog posts:", error);
            res.status(500).json({error: "Failed to retrieve blog posts"});
        }
    }
}