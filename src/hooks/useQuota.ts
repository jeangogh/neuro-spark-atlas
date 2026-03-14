import { useState, useCallback } from "react";

const QUOTA_KEY = "glab_quota";

interface Quota {
  audios: string[];   // IDs of consumed items
  textos: string[];
  testes: string[];
}

const loadQuota = (): Quota => {
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    return raw ? JSON.parse(raw) : { audios: [], textos: [], testes: [] };
  } catch { return { audios: [], textos: [], testes: [] }; }
};

const saveQuota = (q: Quota) => localStorage.setItem(QUOTA_KEY, JSON.stringify(q));

export function useQuota() {
  const [quota, setQuota] = useState<Quota>(loadQuota);

  const consume = useCallback((type: keyof Quota, id: string) => {
    setQuota(prev => {
      if (prev[type].includes(id)) return prev;
      const next = { ...prev, [type]: [...prev[type], id] };
      saveQuota(next);
      return next;
    });
  }, []);

  const canAccess = useCallback((type: keyof Quota, id: string): boolean => {
    const q = loadQuota();
    return q[type].includes(id) || q[type].length < 3;
  }, []);

  const remaining = useCallback((type: keyof Quota): number => {
    const q = loadQuota();
    return Math.max(0, 3 - q[type].length);
  }, []);

  const isLocked = useCallback((type: keyof Quota, id: string): boolean => {
    return !canAccess(type, id);
  }, [canAccess]);

  return { quota, consume, canAccess, remaining, isLocked };
}
