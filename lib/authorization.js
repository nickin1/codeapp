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
