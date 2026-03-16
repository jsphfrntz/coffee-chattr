import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/api/client";
import type { User } from "@/api/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name?: string;
    graduation_year?: number;
  }) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (
    full_name: string,
    graduation_year: number
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name?: string;
    graduation_year?: number;
  }) => {
    const u = await api.register(data);
    setUser(u);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const completeOnboarding = async (
    full_name: string,
    graduation_year: number
  ) => {
    const u = await api.completeOnboarding(full_name, graduation_year);
    setUser(u);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        completeOnboarding,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
