create table if not exists public.auth_access_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  pagina text not null default '/auth',
  criado_em timestamp with time zone not null default now()
);

alter table public.auth_access_attempts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'auth_access_attempts'
      and policyname = 'Anyone can insert auth access attempts'
  ) then
    create policy "Anyone can insert auth access attempts"
    on public.auth_access_attempts
    for insert
    with check (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'auth_access_attempts'
      and policyname = 'Service role can read auth access attempts'
  ) then
    create policy "Service role can read auth access attempts"
    on public.auth_access_attempts
    for select
    using (auth.role() = 'service_role');
  end if;
end
$$;

create index if not exists idx_auth_access_attempts_email on public.auth_access_attempts (email);
create index if not exists idx_auth_access_attempts_criado_em on public.auth_access_attempts (criado_em desc);