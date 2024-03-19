import { NextAuthOptions, User, getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

import prisma from "./prisma";

export const authConfig: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "example@example.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials || !credentials.email || !credentials.password)
                    return null;

                const dbUser = await prisma.user.findFirst({
                    where: { email: credentials.email },
                });

                //Verify Password here
                //We are going to use a simple === operator
                //In production DB, passwords should be encrypted using something like bcrypt...
                if (dbUser && dbUser.password === credentials.password) {
                    const { password, createdAt, id, ...dbUserWithoutPassword } = dbUser;
                    return dbUserWithoutPassword as User;
                }

                return null;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: 'https://www.googleapis.com/auth/drive',
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                    // Add any other scopes needed
                },
            },
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        }),

    ],
    callbacks: {
        async jwt({ token, account }) {
            // Forward the accessToken to the JWT token
            if (account?.accessToken) {
                token.accessToken = account.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            // Forward the accessToken to the session
            if (token?.accessToken) {
                //@ts-ignore
                session.accessToken = token.accessToken;
            }
            return session;
        },
    },
};

export async function loginIsRequiredServer() {
    const session = await getServerSession(authConfig);
    if (!session) return redirect("/");
}

export function loginIsRequiredClient() {
    if (typeof window !== "undefined") {
        const session = useSession();
        const router = useRouter();
        if (!session) router.push("/");
    }
}