// Tipe terkait autentikasi. Lihat juga `src/services/auth/authService.ts`.
import type { User } from './user';

export interface AuthResponse {
  token: string;
  user: User & { onboardingCompleted: boolean };
}

export type AuthMode = 'login' | 'register';
