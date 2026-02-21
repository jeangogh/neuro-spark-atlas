
-- Tabela para rastrear preferências de tema e tipografia
CREATE TABLE public.preference_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('theme', 'font')),
  value TEXT NOT NULL,
  page TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.preference_events ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (visitantes anônimos)
CREATE POLICY "Anyone can insert preference events"
ON public.preference_events
FOR INSERT
WITH CHECK (true);

-- Somente leitura pública para o painel de analytics
CREATE POLICY "Anyone can read preference events"
ON public.preference_events
FOR SELECT
USING (true);
