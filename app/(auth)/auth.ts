import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUser } from '@/lib/db/queries';
import { supabaseClient } from '@/lib/storage/config';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User & {
    name?: string | null;
    avatarUrl?: string | null;
  };
}

interface ExtendedUser extends User {
  name?: string | null;
  avatarUrl?: string | null;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize({ email, password, name }: any) {
        const users = await getUser(email);
        if (users.length === 0) return null;
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, users[0].password!);
        if (!passwordsMatch) return null;
        
        const user = users[0] as ExtendedUser;
        
        // Add name if it was provided during registration but not yet in DB
        if (name && !user.name) {
          user.name = name;
        }
        
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.avatarUrl = user.avatarUrl;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.avatarUrl = token.avatarUrl;
      }

      return session;
    },
  },
});
