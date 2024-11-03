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

    // If access token is invalid, attempt to refresh it
    if (!decoded) {
        return { authorized: false, error: "Invalid or expired token" };
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        return { authorized: false, error: "Forbidden" };
    }

    // Check if userId matches
    if (userId && (decoded.userId === userId || user.isAdmin)) {
        return { authorized: true, userId: decoded.userId };
    }

    return { authorized: false, error: "Forbidden" };
}
