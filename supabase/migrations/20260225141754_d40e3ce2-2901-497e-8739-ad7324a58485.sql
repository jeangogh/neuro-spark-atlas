
-- Table to manage shared test invitations
CREATE TABLE public.shared_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  guest_name TEXT,
  guest_email TEXT,
  guest_user_id UUID,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_invites ENABLE ROW LEVEL SECURITY;

-- Inviter can see their own invites
CREATE POLICY "Inviters can view their own invites"
ON public.shared_invites
FOR SELECT
USING (auth.uid() = inviter_id);

-- Authenticated users can create invites
CREATE POLICY "Users can create invites"
ON public.shared_invites
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

-- Anyone can read an invite by code (for the guest flow)
CREATE POLICY "Anyone can read invite by code"
ON public.shared_invites
FOR SELECT
USING (true);

-- Guest can claim an invite (update guest info)
CREATE POLICY "Guests can claim invites"
ON public.shared_invites
FOR UPDATE
USING (used_at IS NULL)
WITH CHECK (guest_user_id = auth.uid());
