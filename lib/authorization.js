import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from './auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authorizeRequest(req, userId) {
    console.log(`Authorization attempt for userId: ${userId}`);
    const authorizationHeader = req.headers['authorization'];
    const accessToken = authorizationHeader?.split(' ')[1];

    if (!accessToken) {
        console.log("No access token provided in request");
        return { authorized: false, error: "Unauthorized" };
    }

    // Verify the access token
    console.log("Attempting to verify access token");
    let decoded = verifyAccessToken(accessToken);

    if (!decoded) {
        console.log("Token verification failed");
        return { authorized: false, error: "Invalid or expired token", badToken: true };
    }
    console.log(`Token decoded successfully for user: ${decoded.userId}`);

    const potentialAdmin = await prisma.user.findUnique({
        where: { id: decoded.userId },
    });
    console.log(`User admin status: ${potentialAdmin?.isAdmin}`);

    if (potentialAdmin.isAdmin) {
        console.log("Admin access granted");
        return { authorized: true, userId: decoded.userId, isAdmin: potentialAdmin.isAdmin };
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    console.log(`Target user found: ${!!user}`);

    if (!user) {
        console.log("User not found in database");
        return { authorized: false, error: "Forbidden" };
    }

    // Check if userId matches
    if (userId && decoded.userId === userId) {
        console.log("User authorized - ID match confirmed");
        return { authorized: true, userId: decoded.userId, isAdmin: potentialAdmin.isAdmin };
    }

    console.log("Authorization failed - userId mismatch");
    return { authorized: false, error: "Forbidden" };
}
