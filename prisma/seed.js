const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Create a sample user
    const user = await prisma.user.create({
        data: {
            email: 'sampleuser@example.com',
            password: 'hashedpassword',
            firstName: 'Sample',
            lastName: 'User',
        },
    });

    // Create sample tags
    const tags = await prisma.tag.createMany({
        data: [
            { name: 'JavaScript' },
            { name: 'Prisma' },
            { name: 'Next.js' },
        ],
    });

    // Create sample blog posts
    await prisma.blogPost.create({
        data: {
            title: 'Introduction to Prisma with Next.js',
            content: 'This is a sample blog post.',
            authorId: user.id,
            tags: {
                connect: [{ id: tags[0].id }, { id: tags[1].id }],
            },
        },
    });

    await prisma.blogPost.create({
        data: {
            title: 'Advanced GraphQL with Prisma',
            content: 'This is another sample blog post.',
            authorId: user.id,
            tags: {
                connect: [{ id: tags[1].id }, { id: tags[2].id }],
            },
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
