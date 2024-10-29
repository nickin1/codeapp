import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken } from "../../../lib/auth";

const prisma = new PrismaClient()

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed.' })
    }

    try {

        const { email, password, firstName, lastName, phoneNumber } = req.body;

        if (!email || !password || !firstName || !lastName || !phoneNumber) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const hashed = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashed,
                firstName,
                lastName,
                phoneNumber,
            },
        });

        const accessToken = generateAccessToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: newUser.id,
            },
        });

        res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);


        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
            },
            accessToken,
        });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
