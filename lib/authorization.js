import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function authorizeRequest(req, id, res) {
    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session || session.user.id !== id) {
            return { authorized: false };
        }

        return {
            authorized: true,
            userId: session.user.id,
            isAdmin: session.user.isAdmin || false
        };
    } catch (error) {
        console.error("Authorization error:", error);
        return { authorized: false };
    }
}

export async function authorizeRequestNoUserID(req) {
    console.log("Authorization attempt without userId");
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
    else {
        console.log("User access granted");
        return { authorized: true, userId: decoded.userId, isAdmin: potentialAdmin.isAdmin };
    }
}