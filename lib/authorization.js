import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from './auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authorizeRequest(req, userId) {
    const authorizationHeader = req.headers['authorization'];
    const accessToken = authorizationHeader?.split(' ')[1];

    if (!accessToken) {
        return { authorized: false, error: "Unauthorized" };
    }

    // Verify the access token
    let decoded = verifyAccessToken(accessToken);

    if (!decoded) {
        return { authorized: false, error: "Invalid or expired token", badToken: true };
    }

    const potentialAdmin = await prisma.user.findUnique({
        where: { id: decoded.userId },
    });

    if (potentialAdmin.isAdmin) {
        return { authorized: true, userId: decoded.userId, isAdmin: potentialAdmin.isAdmin };
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return { authorized: false, error: "Forbidden" };
    }

    // Check if userId matches
    if (userId && decoded.userId === userId) {
        return { authorized: true, userId: decoded.userId, isAdmin: potentialAdmin.isAdmin };
    }

    return { authorized: false, error: "Forbidden" };
}
