import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import db from "@/lib/db";
import {compare} from "bcrypt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    secret: process.env.NEXTAUTH_SECRET as string,
    session: {
        strategy: 'jwt'
    },
    pages: {
      signIn: '/sign-in'
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "josephbiden@whitehouse.gov" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null
                }

                const user = await db.user.findUnique({
                    where: {
                        email: credentials.email,
                    }
                })

                if (!user || !await compare(credentials.password, user.password)) {
                    return null
                }

                return {
                    id: user.id,
                    username: user.name,
                    email: user.email
                }
            }
        })
    ],
    callbacks: {
        async session({ session, user, token }) {
            return  {
                ...session,
                user: {
                    ...session.user,
                    username: token.username
                }
            }
        },
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    username: user.username
                }
            }
            return token
        }
    }
}