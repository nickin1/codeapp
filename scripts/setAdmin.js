const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setUserAsAdmin(email) {
    try {
        const user = await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                isAdmin: true,
                isActivated: true,
            },
        })

        if (user) {
            console.log(`Successfully set user ${email} as admin and activated their account`)
            console.log('User details:', user)
        }
    } catch (error) {
        console.error(`Error setting user as admin:`, error)
    } finally {
        await prisma.$disconnect()
    }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
    console.error('Please provide an email address')
    process.exit(1)
}

setUserAsAdmin(email) 