// Powered by OnSpace.AI
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  mobile: string;
  customerId: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (profile: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@device_diag_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function login(profile: UserProfile) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  }

  async function logout() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
