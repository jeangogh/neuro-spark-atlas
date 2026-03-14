/**
 * Oracle — Sistema de tracking ecológico
 * Coleta eventos comportamentais implícitos para análise longitudinal.
 * Princípio: a máquina registra, não interpreta.
 */

const ORACLE_KEY = "glab_oracle_log";
const SESSION_KEY = "glab_oracle_session";
const MAX_EVENTS = 2000;

interface OracleEvent {
  type: string;
  ts: number;            // timestamp ms
  session_id: string;
  metadata: Record<string, unknown>;
}

// Session ID — persists per browser session
function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

// Append event to local log
function appendToLog(event: OracleEvent) {
  try {
    const raw = localStorage.getItem(ORACLE_KEY);
    const log: OracleEvent[] = raw ? JSON.parse(raw) : [];
    log.push(event);
    // Keep only last MAX_EVENTS
    if (log.length > MAX_EVENTS) log.splice(0, log.length - MAX_EVENTS);
    localStorage.setItem(ORACLE_KEY, JSON.stringify(log));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

// Try to send to Supabase (fire-and-forget)
async function sendToSupabase(event: OracleEvent) {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return;

    await fetch(`${url}/rest/v1/oracle_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        session_id: event.session_id,
        event_type: event.type,
        timestamp_ms: event.ts,
        metadata: event.metadata,
      }),
    });
  } catch {
    // Network error — event is still in local log
  }
}

/**
 * Track an event.
 * Stores locally + attempts Supabase insert.
 */
export function trackEvent(type: string, metadata: Record<string, unknown> = {}) {
  const event: OracleEvent = {
    type,
    ts: Date.now(),
    session_id: getSessionId(),
    metadata,
  };
  appendToLog(event);
  sendToSupabase(event);
}

/**
 * Get local event log (for debugging/export).
 */
export function getLocalLog(): OracleEvent[] {
  try {
    const raw = localStorage.getItem(ORACLE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Auto-track session start
trackEvent("session_start", {
  url: window.location.pathname,
  referrer: document.referrer || null,
  screen: `${window.screen.width}x${window.screen.height}`,
  ua: navigator.userAgent.slice(0, 100),
});
