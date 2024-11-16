import { PrismaClient } from "@prisma/client";
import { authorizeRequest } from "../../lib/authorization";

const prisma = new PrismaClient();

// Predefined color options
const colorOptions = {
    yellow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3TsQ2AMADAsNL+/xC3IdEHqqww2BdkyfXc6x3A0fw6AP7MIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDAJhAyfSBEga26+EAAAAAElFTkSuQmCC",
    green: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3TsQ2AMADAsNLexv8PIdEHqqww2BdkyXU/6x3A0fw6AP7MIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDAJhAxbbA9NK+lnRAAAAAElFTkSuQmCC",
    blue: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3TsQ2AMADAsNL+/xg3IdEHqqww2BdkybXu5x3A0fw6AP7MIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDAJhA0SJBFgcFpE5AAAAAElFTkSuQmCC",
};

export default async function handler(req, res) {

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "Missing User id" });
    }

    if (req.method === "GET") {
        try {
            const userProfile = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!userProfile) {
                return res.status(404).json({ error: "User profile not found" });
            }

            return res.status(200).json(userProfile);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return res.status(500).json({ error: "Failed to fetch user profile" });
        }
    } else if (req.method === "POST") {
        const { firstName, lastName, phone, color, email } = req.body;

        const authResult = await authorizeRequest(req, userId); // Check if the user is authorized

        if (!authResult.authorized) {
            return res.status(403).json({ error: authResult.error }); // Return 403 if not authorized
        }

        // Validate color against predefined options
        if (color && !Object.keys(colorOptions).includes(color)) {
            return res.status(400).json({ error: "Invalid color option provided." });
        }

        try {

            // Find the existing user
            const originalUser = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!originalUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if the new email is already in use by another user
            if (email && email !== originalUser.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: email },
                });

                if (existingUser) {
                    return res.status(400).json({ error: "Email is already in use by another user." });
                }
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    firstName: firstName || originalUser.firstName,
                    lastName: lastName || originalUser.lastName,
                    phoneNumber: phone || originalUser.phoneNumber,
                    email: email || originalUser.email,
                    avatar: colorOptions[color] || originalUser.avatar, // Set the color to the corresponding base64 value
                },
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error("Error updating user profile:", error);
            return res.status(500).json({ error: "Failed to update user profile" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}

// used chatGPT for color validation
