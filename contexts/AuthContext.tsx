'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useAuthSync } from '@/hooks/use-auth-sync';

export type UserRole = 'user' | 'creator';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isCreator: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatar?: string | null;
  role?: unknown;
  metadata?: { role?: unknown } | null;
};

function resolveUserRole(user: SessionUser | undefined): UserRole | null {
  if (!user) {
    return null;
  }

  const rawRole = user.role ?? user.metadata?.role;
  return rawRole === 'creator' || rawRole === 'user' ? rawRole : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useAuthSync(); // This also syncs the user to Supabase
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);

  useEffect(() => {
    setRoleOverride(null);
  }, [session?.user?.id]);

  const sessionUser = session?.user as SessionUser | undefined;
  const baseRole = resolveUserRole(sessionUser) ?? 'user';
  const user = useMemo<User | null>(() => {
    if (!sessionUser) {
      return null;
    }

    return {
      id: sessionUser.id,
      name: sessionUser.name ?? sessionUser.email ?? 'User',
      email: sessionUser.email ?? '',
      avatar: sessionUser.image ?? sessionUser.avatar ?? undefined,
      role: roleOverride ?? baseRole,
    };
  }, [baseRole, roleOverride, sessionUser]);

  const login = (_role: UserRole = 'user') => {
    router.push('/auth/sign-in');
  };

  const logout = () => {
    void authClient.signOut();
  };

  const switchRole = () => {
    if (!sessionUser) {
      return;
    }
    setRoleOverride((current) => {
      const role = current ?? baseRole;
      return role === 'creator' ? 'user' : 'creator';
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isCreator: user?.role === 'creator',
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
