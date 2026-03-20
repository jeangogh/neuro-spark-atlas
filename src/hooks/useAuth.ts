import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session, AuthError } from "@supabase/supabase-js";

function buildInstantPassword(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  }
  return `Ahsd#${hash.toString(16).padStart(8, "0")}!2026`;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, nextSession) => {
      resolved = true;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!resolved) {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const password = buildInstantPassword(normalizedEmail);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!signInError) {
      return { error: null as AuthError | null };
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/selecionar-teste",
      },
    });

    const isAlreadyRegistered =
      !!signUpError?.message && /already registered|already exists/i.test(signUpError.message);

    if (signUpError && !isAlreadyRegistered) {
      return { error: signUpError };
    }

    if (isAlreadyRegistered) {
      await supabase.functions.invoke("reset-user-password", {
        body: { email: normalizedEmail, password },
      });
    }

    const { error: retryError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    return { error: retryError };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signInWithOtp, signOut };
}
