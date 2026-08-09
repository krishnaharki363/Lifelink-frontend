import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'DONOR' | 'HOSPITAL' | 'BLOOD_BANK';
  isEmailVerified: boolean;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  bloodType?: string;
  city?: string;
  state?: string;
  phone?: string;
  province?: string;
  district?: string;
  municipality?: string;
  address?: string;
  availability?: string;
  notificationsEnabled?: boolean;
  status?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
