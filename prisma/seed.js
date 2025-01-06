const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                name: 'Admin',
                isAdmin: true,
                isActivated: true,
            },
        });
        console.log({ adminUser });
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
