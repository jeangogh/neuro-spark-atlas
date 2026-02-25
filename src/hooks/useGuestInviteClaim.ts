import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * After a guest verifies OTP and logs in, this hook checks sessionStorage
 * for pending invite info and claims the invite (marks it as used).
 */
export function useGuestInviteClaim() {
  useEffect(() => {
    const raw = sessionStorage.getItem("guest_invite");
    if (!raw) return;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const invite = JSON.parse(raw);

      // Claim the invite
      const { error } = await supabase
        .from("shared_invites")
        .update({
          guest_user_id: user.id,
          guest_name: invite.guest_name,
          guest_email: invite.guest_email,
          used_at: new Date().toISOString(),
        })
        .eq("id", invite.invite_id)
        .is("used_at", null);

      if (!error) {
        // Update profile name if not set
        await supabase
          .from("profiles")
          .update({ nome: invite.guest_name })
          .eq("user_id", user.id);

        // Mark this user as a guest in localStorage
        localStorage.setItem("guest_invite_code", invite.invite_code);
      }

      sessionStorage.removeItem("guest_invite");
    })();
  }, []);
}
