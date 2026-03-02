
-- Tabela de qualificação de leads
CREATE TABLE public.qualification_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  interesse TEXT NOT NULL,
  faixa_renda TEXT NOT NULL,
  preferencia_aprendizado TEXT NOT NULL,
  momento_atual TEXT NOT NULL,
  investimento TEXT NOT NULL,
  contato_ahsd TEXT NOT NULL,
  pergunta_condicional TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qualification_responses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert own qualification"
  ON public.qualification_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own qualification"
  ON public.qualification_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own qualification"
  ON public.qualification_responses FOR UPDATE
  USING (auth.uid() = user_id);
