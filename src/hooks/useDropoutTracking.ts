import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DropoutConfig {
  testType: string;
  totalQuestions: number;
  userId: string | undefined;
}

/**
 * Tracks quiz dropout: records the last answered question when user
 * leaves the page without completing the test.
 */
export function useDropoutTracking(
  config: DropoutConfig,
  answeredCount: number,
  completed: boolean
) {
  const answeredRef = useRef(answeredCount);
  const completedRef = useRef(completed);
  const sentRef = useRef(false);

  useEffect(() => { answeredRef.current = answeredCount; }, [answeredCount]);
  useEffect(() => { completedRef.current = completed; }, [completed]);

  const sendDropout = useCallback(() => {
    if (sentRef.current || completedRef.current || answeredRef.current === 0 || !config.userId) return;
    sentRef.current = true;

    const payload = JSON.stringify({
      user_id: config.userId,
      test_type: config.testType,
      last_question_index: answeredRef.current,
      total_questions: config.totalQuestions,
    });

    // Use sendBeacon for reliability on page unload
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/quiz_dropouts`;
    const sent = navigator.sendBeacon(
      url,
      new Blob([payload], { type: "application/json" })
    );

    // sendBeacon doesn't support custom headers easily, fallback to fetch
    if (!sent) {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          Prefer: "return=minimal",
        },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [config.userId, config.testType, config.totalQuestions]);

  useEffect(() => {
    // Reset on new quiz session
    sentRef.current = false;
  }, [config.testType]);

  useEffect(() => {
    const handleBeforeUnload = () => sendDropout();
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") sendDropout();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
      // Also fire on unmount (navigating away from quiz page)
      sendDropout();
    };
  }, [sendDropout]);
}
