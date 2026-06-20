import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '@/types';

// Scaffolding auth terpisah. Saat ini AppContext masih memegang sesi user;
// context ini disiapkan untuk memisahkan concern auth saat app membesar.
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
