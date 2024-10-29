import { PrismaClient } from "@prisma/client";
import { generateAccessToken, verifyRefreshToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const refreshToken = req.cookies.refreshToken;


    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {

        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const storedToken = await prisma.refreshToken.findUnique({
            where: {
                token: refreshToken
            }
        })

        if (!storedToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }

        const newAccessToken = generateAccessToken(decoded.userId);

        res.status(200).json({
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

}