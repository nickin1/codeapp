import { DefaultSession, NextAuthOptions, Session } from "next-auth";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
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
        async signIn({ profile, account }) {
            const githubProfile = profile as GithubProfile;

            const existingAccount = await prisma.account.findFirst({
                where: {
                    provider: account?.provider,
                    providerAccountId: account?.providerAccountId,
                },
                include: {
                    user: true
                }
            });

            if (existingAccount?.user) {
                await prisma.user.update({
                    where: { id: existingAccount.user.id },
                    data: {
                        name: githubProfile.name ?? existingAccount.user.name,
                        image: githubProfile.avatar_url ?? existingAccount.user.image,
                        github_url: githubProfile.html_url ?? existingAccount.user.github_url,
                        last_login: new Date(),
                    }
                });

                if (!existingAccount.user.isActivated) {
                    return '/?show=activation-pending';
                }
                return true;
            }

            if (!profile || !account) {
                return '/?show=activation-pending';
            }

            const newUser = await prisma.user.create({
                data: {
                    name: githubProfile.name ?? "Unknown",
                    email: githubProfile.email ?? "",
                    image: githubProfile.avatar_url ?? "",
                    github_url: githubProfile.html_url ?? "",
                    last_login: new Date(),
                    accounts: {
                        create: {
                            provider: account.provider,
                            providerAccountId: account.providerAccountId,
                            type: account.type,
                        }
                    }
                }
            });

            return '/?show=activation-pending';
        },
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                session.user.isAdmin = user.isAdmin ?? false;
                session.user.isActivated = user.isActivated ?? false;

                if (!user.isActivated) {
                    return {} as Session;
                }
            }
            return session;
        }
    }
}; 