
CREATE TABLE public.quiz_dropouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  test_type text NOT NULL,
  last_question_index integer NOT NULL,
  total_questions integer NOT NULL,
  last_question_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_dropouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert dropouts" ON public.quiz_dropouts
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Service role can read dropouts" ON public.quiz_dropouts
  FOR SELECT TO public USING (auth.role() = 'service_role'::text);

CREATE POLICY "Users can view own dropouts" ON public.quiz_dropouts
  FOR SELECT TO public USING (auth.uid() = user_id);
