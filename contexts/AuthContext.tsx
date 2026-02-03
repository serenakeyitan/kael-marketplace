'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Auto-login for demo purposes
    const mockUser: User = {
      id: '1',
      name: 'Demo User',
      email: 'demo@kael.im',
      role: 'user',
    };
    setUser(mockUser);
  }, []);

  const login = (role: UserRole = 'user') => {
    const mockUser: User = {
      id: '1',
      name: role === 'creator' ? 'Demo Creator' : 'Demo User',
      email: role === 'creator' ? 'creator@kael.im' : 'user@kael.im',
      role,
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = () => {
    if (user) {
      const newRole: UserRole = user.role === 'user' ? 'creator' : 'user';
      setUser({
        ...user,
        role: newRole,
        name: newRole === 'creator' ? 'Demo Creator' : 'Demo User',
        email: newRole === 'creator' ? 'creator@kael.im' : 'user@kael.im',
      });
    }
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