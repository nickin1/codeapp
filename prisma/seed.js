const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('adminPassword123', 10); // Set your desired admin password

    try {
        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@example.com', // Change to desired admin email
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                phoneNumber: '+11239876345',
                isAdmin: true,
            },
        });
        console.log({ adminUser });
    } catch (error) {
        if (error.code === 'P2002') {
            console.error('Admin user already exists.'); // Handle the unique constraint violation
        } else {
            console.error('Error creating admin user:', error);
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
