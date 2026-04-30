import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Dados inválidos");
        }

        // Usando RAW SQL para contornar o cache travado do Prisma/Turbopack
        // Isso garante que o campo 'password' seja lido mesmo que o cliente esteja desatualizado
        const users = await prisma.$queryRawUnsafe<{ id: string; name: string; email: string; image: string; role: string; password?: string }[]>(
          `SELECT * FROM "User" WHERE email = $1 LIMIT 1`,
          credentials.email
        );
        
        const user = users?.[0];

        if (!user || !user.password) {
          throw new Error("Usuário não encontrado ou cadastre-se via Google");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Senha incorreta");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role, // from DB
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // SEGURANÇA DINÂMICA: Verifica em tempo real se o e-mail continua autorizado
      if (token.email === "ciellodev@gmail.com") {
        token.role = "ADMIN";
      } else {
        // Busca direta no banco ignorando maiúsculas/minúsculas
        const authorized = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "AuthorizedAdmin" 
          WHERE LOWER(email) = LOWER(${token.email || ""}) 
          LIMIT 1
        `;
        
        token.role = authorized.length > 0 ? "ADMIN" : "STUDENT";

        // ATIVIDADE EM TEMPO REAL: Atualiza o visto por último via SQL
        if (token.email) {
          prisma.$executeRaw`UPDATE "User" SET "lastSeen" = NOW() WHERE email = ${token.email}`.catch(() => {});
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
