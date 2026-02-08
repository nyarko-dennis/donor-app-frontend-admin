import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                code: { label: "2FA Code", type: "text" }, // Optional
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

                    const response = await axios.post(`${backendUrl}/auth/login`, {
                        email: credentials.email,
                        password: credentials.password,
                        code: credentials.code, // Pass 2FA code if provided
                    });

                    // Check for 2FA requirement
                    if (response.data.isTwoFactorAuthenticationRequired) {
                        // We can throw an error that the client can catch to redirect
                        // Or return a special object. NextAuth error handling is tricky.
                        // Best practice with NextAuth is often to throw an Error "2FA_REQUIRED"
                        throw new Error("2FA_REQUIRED");
                    }

                    const user = response.data;

                    if (user && user.accessToken) {
                        // Return user object with token
                        return {
                            id: user.userData.id,
                            name: `${user.userData.first_name} ${user.userData.last_name}`,
                            email: user.userData.email,
                            role: user.userData.role,
                            accessToken: user.accessToken,
                        };
                    }

                    return null;
                } catch (error: any) {
                    if (error.message === "2FA_REQUIRED") {
                        throw error;
                    }
                    console.error("Login failed:", error.response?.data || error.message);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.accessToken = token.accessToken;
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login", // Redirect to login page on error
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
