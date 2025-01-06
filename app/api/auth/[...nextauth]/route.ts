import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isAdmin: boolean;
            isActivated: boolean;
        } & DefaultSession["user"]
    }
    interface User {
        isAdmin?: boolean;
        isActivated?: boolean;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? "",
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Check if user exists
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email! }
            });

            if (dbUser?.isActivated) {
                return true;
            }

            // If user doesn't exist, create them as deactivated
            if (!dbUser) {
                await prisma.user.create({
                    data: {
                        email: user.email!,
                        name: user.name,
                        image: user.image,
                        isActivated: false
                    }
                });
            }

            // Return false with a custom URL parameter
            return '/?show=activation-pending';
        },
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                session.user.isAdmin = user.isAdmin ?? false;
                session.user.isActivated = user.isActivated ?? false;
            }
            return session;
        }
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
