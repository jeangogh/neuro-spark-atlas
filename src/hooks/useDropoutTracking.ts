import { useEffect, useRef, useCallback } from "react";

/**
 * Tracks quiz dropout: records the last answered question when user
 * leaves the page without completing the test.
 */
export function useDropoutTracking(
  testType: string,
  totalQuestions: number,
  userId: string | undefined,
  answeredCount: number,
  completed: boolean
) {
  const answeredRef = useRef(answeredCount);
  const completedRef = useRef(completed);
  const sentRef = useRef(false);

  useEffect(() => { answeredRef.current = answeredCount; }, [answeredCount]);
  useEffect(() => { completedRef.current = completed; }, [completed]);

  const sendDropout = useCallback(() => {
    if (sentRef.current || completedRef.current || answeredRef.current === 0 || !userId) return;
    sentRef.current = true;

    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/quiz_dropouts`;
    const payload = JSON.stringify({
      user_id: userId,
      test_type: testType,
      last_question_index: answeredRef.current,
      total_questions: totalQuestions,
    });
    const headers = {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      Prefer: "return=minimal",
    };

    fetch(url, { method: "POST", headers, body: payload, keepalive: true }).catch(() => {});
  }, [userId, testType, totalQuestions]);

  useEffect(() => {
    sentRef.current = false;
  }, [testType]);

  useEffect(() => {
    const onUnload = () => sendDropout();
    const onHide = () => { if (document.visibilityState === "hidden") sendDropout(); };

    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("visibilitychange", onHide);
      sendDropout();
    };
  }, [sendDropout]);
}
