import { PrismaClient } from "@prisma/client";
import { generateRefreshToken, generateAccessToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided' });
    }

    try {
        await prisma.refreshToken.delete({
            where: {
                token: refreshToken
            }
        });


        res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');

        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}