import { UserService } from "@/services/UserService";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await UserService.findByEmail(credentials.email);

          if (!user) {
            return null;
          }

          const isPasswordValid = await UserService.comparePassword(
            user,
            credentials.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Update last login
          await UserService.updateLastLogin(user._id!.toString());

          return {
            id: user._id!.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Handle custom redirect logic
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // If it's a callback URL with admin path, redirect to admin
      if (url.includes("callbackUrl") && url.includes("admin")) {
        const urlObj = new URL(url);
        const callbackUrl = urlObj.searchParams.get("callbackUrl");
        if (callbackUrl) {
          return `${baseUrl}${callbackUrl}`;
        }
      }

      // Default redirect logic
      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
