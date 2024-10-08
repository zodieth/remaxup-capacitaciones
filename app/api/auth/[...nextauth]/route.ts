import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import * as bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email",
          type: "text",
          placeholder: "jsmith",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials, req) {
        if (credentials) {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              image: true,
              role: true,
              agentId: true,
            },
          });

          if (!user)
            throw new Error(
              JSON.stringify({
                message: "No user found",
                ok: false,
              })
            );

          const matchPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!matchPassword) return null;

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            image: user.image,
            agentId: user.agentId,
          };
        }

        return null;
      },
    }),
  ],
  // session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // NextAuthX: "/login",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.agentId = user.agentId;
      }

      return token;
    },

    async session({ session, token }: any) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          agentId: token.agentId,
        },
      };
    },
  },
};

const authHandler = NextAuth(authOptions);

export { authHandler as GET, authHandler as POST };
