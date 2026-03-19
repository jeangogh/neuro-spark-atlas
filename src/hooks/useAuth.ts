import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        resolved = true;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        // Clean magic link token from URL so it doesn't leak in history/referer
        if (window.location.hash.includes("access_token")) {
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
    );

    const hasAuthFragment = window.location.hash.includes("access_token");
    if (!hasAuthFragment) {
      // No magic link — safe to check existing session immediately
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!resolved) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      });
    } else {
      // Magic link present — give onAuthStateChange 3s to resolve, then fallback
      setTimeout(() => {
        if (!resolved) {
          supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          });
        }
      }, 3000);
    }

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/selecionar-teste" },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signInWithOtp, signOut };
}
