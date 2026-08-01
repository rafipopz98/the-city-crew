"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string;
  role: string;
  username?: string;
  signedUpFromLogin?: boolean;
  profile_completed?: boolean;
  /** Name fallback: first_name, else username, else email prefix */
  displayName?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      let res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.status === 401) {
        await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        res = await fetch("/api/auth/me");
      }

      const data = await res.json();

      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
