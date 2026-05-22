
create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  country text not null,
  user_type text not null,
  pain_point text,
  referral_code text unique not null default substr(md5(random()::text), 1, 8),
  referred_by text,
  created_at timestamptz not null default now()
);

create unique index waitlist_email_unique on public.waitlist_signups (lower(email));

alter table public.waitlist_signups enable row level security;

-- Allow anyone (anon) to insert their signup
create policy "Anyone can sign up to waitlist"
on public.waitlist_signups
for insert
to anon, authenticated
with check (true);

-- Public count via a security definer function (no select policy needed)
create or replace function public.get_waitlist_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.waitlist_signups;
$$;

grant execute on function public.get_waitlist_count() to anon, authenticated;
