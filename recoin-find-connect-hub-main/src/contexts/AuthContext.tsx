import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, TokenEntry } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/services/api";

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  addTokens: (amount: number, reason?: string) => void;
  addReputation: (amount: number) => void;
  incrementHelps: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  getActiveTokens: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

function mapUserData(data: any): UserProfile {
  return {
    id: data._id || data.id,
    name: data.name || "User",
    email: data.email || "",
    location: data.location || "",
    tokens: data.tokens ?? 10,
    reputation: data.reputation ?? 0,
    totalHelps: data.totalHelps ?? 0,
    badges: data.badges || [],
    joinedDate: data.joinedDate || data.createdAt || new Date().toISOString(),
    tokenHistory: data.tokenHistory || [],
    bio: data.bio || "",
    phone: data.phone || "",
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // On mount, check for stored token and load profile
  useEffect(() => {
    const token = localStorage.getItem("cc_token");
    if (token) {
      authApi.getMe()
        .then((res) => {
          if (res.success && res.user) {
            setCurrentUser(mapUserData(res.user));
          } else {
            localStorage.removeItem("cc_token");
          }
        })
        .catch(() => {
          localStorage.removeItem("cc_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.token && res.user) {
        localStorage.setItem("cc_token", res.token);
        setCurrentUser(mapUserData(res.user));
        toast({ title: "Welcome back! 👋" });
        setLoading(false);
        return true;
      }
      toast({ title: "Login failed", description: res.error || "Invalid credentials", variant: "destructive" });
      setLoading(false);
      return false;
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message || "Something went wrong", variant: "destructive" });
      setLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await authApi.signup(name, email, password);
      if (res.success && res.token && res.user) {
        localStorage.setItem("cc_token", res.token);
        setCurrentUser(mapUserData(res.user));
        toast({ title: "Account created! 🎉", description: "Welcome to CampusConnect AI" });
        setLoading(false);
        return true;
      }
      toast({ title: "Signup failed", description: res.error || "Could not create account", variant: "destructive" });
      setLoading(false);
      return false;
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message || "Something went wrong", variant: "destructive" });
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("cc_token");
    setCurrentUser(null);
    toast({ title: "Logged out" });
  };

  const persistProfile = async (updated: UserProfile) => {
    setCurrentUser(updated);
    try {
      await authApi.updateProfile({
        name: updated.name,
        location: updated.location,
        tokens: updated.tokens,
        reputation: updated.reputation,
        totalHelps: updated.totalHelps,
        badges: updated.badges,
        bio: updated.bio,
        phone: updated.phone,
        tokenHistory: updated.tokenHistory,
      });
    } catch (error) {
      console.error("Failed to persist profile:", error);
    }
  };

  const addTokens = (amount: number, reason = "Community help") => {
    if (!currentUser) return;
    const now = new Date();
    const entry: TokenEntry = {
      amount,
      reason,
      earnedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    };
    persistProfile({
      ...currentUser,
      tokens: currentUser.tokens + amount,
      tokenHistory: [...(currentUser.tokenHistory || []), entry],
    });
    if (amount > 0) toast({ title: `+${amount} Tokens earned! 🎉` });
  };

  const addReputation = (amount: number) => {
    if (!currentUser) return;
    persistProfile({ ...currentUser, reputation: Math.min(5, currentUser.reputation + amount) });
  };

  const incrementHelps = () => {
    if (!currentUser) return;
    persistProfile({ ...currentUser, totalHelps: currentUser.totalHelps + 1 });
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    persistProfile({ ...currentUser, ...updates });
    toast({ title: "Profile updated!" });
  };

  const getActiveTokens = (): number => {
    if (!currentUser) return 0;
    const now = new Date();
    return (currentUser.tokenHistory || [])
      .filter((t) => new Date(t.expiresAt) > now)
      .reduce((s, t) => s + t.amount, 0);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!currentUser,
        addTokens,
        addReputation,
        incrementHelps,
        updateProfile,
        getActiveTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
