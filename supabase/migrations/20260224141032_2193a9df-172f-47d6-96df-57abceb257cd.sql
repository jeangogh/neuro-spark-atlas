
-- Add test_type column to quiz_results to distinguish between different tests
ALTER TABLE public.quiz_results 
ADD COLUMN test_type text NOT NULL DEFAULT 'neurocognitivo';

-- Add index for faster queries by user + test type
CREATE INDEX idx_quiz_results_user_test ON public.quiz_results (user_id, test_type, created_at DESC);
