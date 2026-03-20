
CREATE TABLE public.feedbacks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  pagina text NOT NULL,
  o_que_esta_bom text,
  o_que_esta_ruim text,
  o_que_quer text,
  criado_em timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
ON public.feedbacks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
ON public.feedbacks FOR SELECT
USING (auth.uid() = user_id);
