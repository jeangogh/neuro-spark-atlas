import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PASSWORD = "AhsdLab2026!legacy";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const { users } = await req.json() as {
      users: Array<{
        email: string;
        nome?: string;
        interesse?: string;
        faixa_renda?: string;
        preferencia_aprendizado?: string;
        momento_atual?: string;
        contato_ahsd?: string;
        investimento?: string;
        pergunta_condicional?: string | null;
        created_at?: string;
        test_type?: string;
        answers?: unknown;
        scores?: unknown;
      }>;
    };

    if (!users || !Array.isArray(users)) {
      return new Response(JSON.stringify({ error: "missing users array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = { created: 0, existed: 0, profiles: 0, qualifications: 0, quiz_results: 0, errors: [] as string[] };

    for (const u of users) {
      try {
        const email = u.email.trim().toLowerCase();
        let userId: string | null = null;

        // 1. Try to create user; if exists, find their id
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: SYSTEM_PASSWORD,
          email_confirm: true,
          user_metadata: { nome: u.nome || null },
        });

        if (createError) {
          if (createError.message?.includes("already been registered") || (createError as any).status === 422) {
            // Find existing user by email in profiles first
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("user_id")
              .eq("email", email)
              .limit(1)
              .single();

            if (profile) {
              userId = profile.user_id;
            } else {
              // Fallback: list users to find by email
              const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
              const found = listData?.users?.find((x: any) => x.email === email);
              if (found) {
                userId = found.id;
              }
            }

            if (userId) {
              results.existed++;
            } else {
              results.errors.push(`Cannot find existing user: ${email}`);
              continue;
            }
          } else {
            results.errors.push(`Create ${email}: ${createError.message}`);
            continue;
          }
        } else {
          userId = newUser.user.id;
          results.created++;
        }

        if (!userId) continue;

        // 2. Upsert profile
        const { error: profError } = await supabaseAdmin
          .from("profiles")
          .upsert(
            { user_id: userId, email, nome: u.nome || null },
            { onConflict: "user_id" }
          );
        if (!profError) results.profiles++;
        else results.errors.push(`Profile ${email}: ${profError.message}`);

        // 3. Insert qualification if provided
        if (u.interesse) {
          const { data: existing } = await supabaseAdmin
            .from("qualification_responses")
            .select("id")
            .eq("user_id", userId)
            .limit(1);

          if (!existing || existing.length === 0) {
            const { error: qErr } = await supabaseAdmin.from("qualification_responses").insert({
              user_id: userId,
              interesse: u.interesse || "",
              faixa_renda: u.faixa_renda || "",
              preferencia_aprendizado: u.preferencia_aprendizado || "",
              momento_atual: u.momento_atual || "",
              contato_ahsd: u.contato_ahsd || "",
              investimento: u.investimento || "",
              pergunta_condicional: u.pergunta_condicional || null,
            });
            if (qErr) results.errors.push(`Qual ${email}: ${qErr.message}`);
            else results.qualifications++;
          }
        }

        // 4. Insert quiz results if provided
        if (u.answers && u.scores) {
          const testType = u.test_type || "ahsd_adult";
          const { data: existingResult } = await supabaseAdmin
            .from("quiz_results")
            .select("id")
            .eq("user_id", userId)
            .eq("test_type", testType)
            .limit(1);

          if (!existingResult || existingResult.length === 0) {
            const { error: qrErr } = await supabaseAdmin.from("quiz_results").insert({
              user_id: userId,
              test_type: testType,
              answers: u.answers,
              scores: u.scores,
              created_at: u.created_at || new Date().toISOString(),
            });
            if (qrErr) results.errors.push(`Quiz ${email}: ${qrErr.message}`);
            else results.quiz_results++;
          }
        }
      } catch (err) {
        results.errors.push(`${u.email}: ${String(err)}`);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
