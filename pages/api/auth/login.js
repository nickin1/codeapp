import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt'
import { generateRefreshToken, generateAccessToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' })
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' })
    }

    try {

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.status(401).json({ messsage: 'Invalid email or password' })
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)


        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
            },
        });

        res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`)


        res.status(200).json({
            message: 'Logged in successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
            },
            accessToken,
        });

    } catch (error) {
        console.error('/api/auth/login error: ', error);
        res.status(500).json({ error: 'Internal server error' })
    }
}