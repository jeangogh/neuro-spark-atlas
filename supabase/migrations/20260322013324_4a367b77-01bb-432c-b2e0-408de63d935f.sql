
CREATE TABLE public.eficacia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  test_type text NOT NULL,
  sentiu_entendeu boolean NOT NULL,
  tem_laudo boolean NOT NULL DEFAULT false,
  contato_ahsd text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.eficacia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert eficacia" ON public.eficacia
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own eficacia" ON public.eficacia
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can read all eficacia" ON public.eficacia
  FOR SELECT TO public
  USING (auth.role() = 'service_role'::text);
