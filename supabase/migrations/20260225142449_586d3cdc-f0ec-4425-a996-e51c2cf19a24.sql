
-- Table for bonus test cross-reference requests
CREATE TABLE public.bonus_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  partner_email TEXT NOT NULL,
  partner_id UUID,
  relationship_type TEXT NOT NULL,  -- 'casal', 'pai_filho', 'amigos', 'irmaos', 'outros'
  relationship_detail TEXT,         -- free text for 'outros'
  requester_consented BOOLEAN NOT NULL DEFAULT true,
  partner_consented BOOLEAN NOT NULL DEFAULT false,
  consent_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  analysis_result JSONB,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'consented', 'analyzed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  consented_at TIMESTAMP WITH TIME ZONE,
  analyzed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.bonus_requests ENABLE ROW LEVEL SECURITY;

-- Requester can see their own requests
CREATE POLICY "Requesters can view own requests"
ON public.bonus_requests FOR SELECT
USING (auth.uid() = requester_id);

-- Partner can see requests directed to them
CREATE POLICY "Partners can view their requests"
ON public.bonus_requests FOR SELECT
USING (auth.uid() = partner_id);

-- Authenticated users can create requests
CREATE POLICY "Users can create requests"
ON public.bonus_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Partner can consent (update partner fields)
CREATE POLICY "Partners can consent"
ON public.bonus_requests FOR UPDATE
USING (auth.uid() = partner_id OR status = 'pending');
