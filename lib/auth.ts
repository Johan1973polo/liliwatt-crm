import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Tentative de connexion pour:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.error('[AUTH] Échec: Email ou mot de passe manquant');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.error('[AUTH] Échec: Utilisateur non trouvé pour', credentials.email);
          return null;
        }

        if (!user.isActive) {
          console.error('[AUTH] Échec: Utilisateur inactif pour', credentials.email);
          return null;
        }

        console.log('[AUTH] Utilisateur trouvé:', {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          hasPasswordHash: !!user.passwordHash,
        });

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          console.error('[AUTH] Échec: Mot de passe invalide pour', credentials.email);
          return null;
        }

        console.log('[AUTH] Succès: Authentification réussie pour', credentials.email);
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          referentId: user.referentId,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.referentId = user.referentId;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.referentId = token.referentId as string | null;
        session.user.avatar = token.avatar as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
