
-- Tabela de eventos do funil de conversão
CREATE TABLE public.funnel_events (
  id            UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    TEXT NOT NULL,
  event_type    TEXT NOT NULL, -- quiz_start | step_advance | quiz_complete | checkout_click | quiz_abandon
  step          INTEGER,       -- número da questão atual (1-53)
  total_steps   INTEGER,       -- total de questões (53)
  elapsed_ms    INTEGER,       -- ms desde quiz_start até este evento
  layout        TEXT NOT NULL DEFAULT 'single', -- 'single' | 'multi'
  color_theme   TEXT NOT NULL DEFAULT 'eclipse',
  font_theme    TEXT NOT NULL DEFAULT 'playfair',
  page          TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert funnel events"
ON public.funnel_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read funnel events"
ON public.funnel_events FOR SELECT USING (true);

-- Índices para queries de analytics
CREATE INDEX idx_funnel_session  ON public.funnel_events (session_id);
CREATE INDEX idx_funnel_type     ON public.funnel_events (event_type);
CREATE INDEX idx_funnel_layout   ON public.funnel_events (layout);
CREATE INDEX idx_funnel_created  ON public.funnel_events (created_at DESC);
