drop policy if exists "Anyone can insert auth access attempts" on public.auth_access_attempts;

create policy "Anyone can insert auth access attempts"
on public.auth_access_attempts
for insert
with check (
  length(trim(email)) between 5 and 255
  and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  and pagina = '/auth'
);