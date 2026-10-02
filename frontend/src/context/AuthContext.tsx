import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as api from "../api";
import type { User } from "../types";

interface AuthContextType {
  token: string;
  currentUser: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  handleAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string>(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState<User | null>(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null
  );

  const login = (newToken: string, user: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setCurrentUser(null);
  };

  const handleAuthError = () => {
    logout();
  };

  const fetchCurrentUser = async () => {
    if (!token) return;
    try {
      const u = await api.getMe();
      setCurrentUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    } catch {
      handleAuthError();
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        login,
        logout,
        fetchCurrentUser,
        handleAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
