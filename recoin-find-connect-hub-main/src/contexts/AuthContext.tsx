import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { UserProfile, TokenEntry } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
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

function toUserProfile(user: User, profile: any): UserProfile {
  return {
    id: user.id,
    name: profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
    email: user.email || "",
    location: profile?.location || "",
    tokens: profile?.tokens ?? 10,
    reputation: profile?.reputation ?? 0,
    totalHelps: profile?.total_helps ?? 0,
    badges: profile?.badges || [],
    joinedDate: profile?.joined_date || new Date().toISOString(),
    tokenHistory: profile?.token_history || [],
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    avatar: user.user_metadata?.avatar_url,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const sessionRef = useRef<Session | null>(null);

  const fetchAndSetProfile = async (user: User) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setCurrentUser(toUserProfile(user, data));
      } else {
        // Create profile if missing
        const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
        await supabase.from("profiles").upsert(
          { id: user.id, name, email: user.email || "" },
          { onConflict: "id" }
        );
        const { data: created } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setCurrentUser(toUserProfile(user, created));
      }
    } catch {
      setCurrentUser(toUserProfile(user, null));
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      sessionRef.current = session;
      setSession(session);
      if (session?.user) {
        fetchAndSetProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      sessionRef.current = session;
      setSession(session);
      if (session?.user) {
        fetchAndSetProfile(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Returns true on success, false on failure
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Welcome back! 👋" });
    return true;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setLoading(false);
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return false;
    }
    // Create profile immediately
    if (data.user) {
      await supabase.from("profiles").upsert(
        { id: data.user.id, name, email },
        { onConflict: "id" }
      );
    }
    setLoading(false);
    toast({ title: "Account created! 🎉", description: "Welcome to CampusConnect AI" });
    return true;
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
    sessionRef.current = null;
    toast({ title: "Logged out" });
  };

  const persistProfile = async (updated: UserProfile) => {
    setCurrentUser(updated);
    const currentSession = sessionRef.current;
    if (!currentSession?.user) return;
    await supabase.from("profiles").update({
      name: updated.name,
      location: updated.location,
      tokens: updated.tokens,
      reputation: updated.reputation,
      total_helps: updated.totalHelps,
      badges: updated.badges,
      bio: updated.bio,
      phone: updated.phone,
      token_history: updated.tokenHistory,
    }).eq("id", currentSession.user.id);
  };

  const addTokens = (amount: number, reason = "Community help") => {
    if (!currentUser) return;
    const now = new Date();
    const entry: TokenEntry = {
      amount, reason,
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
      .filter(t => new Date(t.expiresAt) > now)
      .reduce((s, t) => s + t.amount, 0);
  };

  return (
    <AuthContext.Provider value={{
      currentUser, loading, login, signup, loginWithGoogle, logout,
      isAuthenticated: !!currentUser,
      addTokens, addReputation, incrementHelps, updateProfile, getActiveTokens,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
