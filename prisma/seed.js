// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('adminPassword123', 10); // Set your desired admin password

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@exampleadmin.com' }, // Change to desired admin email
        update: {},
        create: {
            email: 'admin@example.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: '+11239876345',
            isAdmin: true,
        },
    });

    console.log({ adminUser });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
