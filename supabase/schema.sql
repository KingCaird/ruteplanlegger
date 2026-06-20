create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'tekniker' check (role in ('admin', 'tekniker'))
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  serial text,
  address text not null,
  contact text,
  phone text,
  note text,
  status text not null default 'Normal' check (status in ('Normal', 'Medium', 'Haster', 'Pågående', 'Ferdig')),
  visible boolean not null default true,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references public.users (id) on delete cascade
);

create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  message text not null,
  timestamp timestamptz not null default now()
);

create index if not exists cases_user_id_idx on public.cases (user_id);
create index if not exists cases_visible_idx on public.cases (visible);
create index if not exists history_case_id_idx on public.history (case_id);
create index if not exists history_timestamp_idx on public.history (timestamp desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cases_updated_at on public.cases;
create trigger set_cases_updated_at
before update on public.cases
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, coalesce(new.email, ''), 'tekniker')
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.users
  where id = auth.uid()
$$;

create or replace function public.ensure_user_profile()
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  profile public.users;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.users (id, email, role)
  values (
    auth.uid(),
    coalesce((auth.jwt() ->> 'email'), ''),
    'tekniker'
  )
  on conflict (id) do update
  set email = excluded.email
  returning * into profile;

  return profile;
end;
$$;

create or replace function public.can_access_case(case_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.cases
    where cases.id = case_uuid
      and (
        public.current_user_role() = 'admin'
        or cases.user_id = auth.uid()
      )
  )
$$;

alter table public.users enable row level security;
alter table public.cases enable row level security;
alter table public.history enable row level security;

drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Admins can read all profiles" on public.users;
drop policy if exists "Users can update own profile email" on public.users;
drop policy if exists "Admins can manage all cases" on public.cases;
drop policy if exists "Technicians can manage own cases" on public.cases;
drop policy if exists "Users can read history for visible cases" on public.history;
drop policy if exists "Users can insert history for accessible cases" on public.history;

create policy "Users can read own profile"
on public.users for select
to authenticated
using (id = auth.uid());

create policy "Admins can read all profiles"
on public.users for select
to authenticated
using (public.current_user_role() = 'admin');

create policy "Users can update own profile email"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = 'tekniker');

create policy "Admins can manage all cases"
on public.cases for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "Technicians can manage own cases"
on public.cases for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can read history for accessible cases"
on public.history for select
to authenticated
using (public.can_access_case(case_id));

create policy "Users can insert history for accessible cases"
on public.history for insert
to authenticated
with check (public.can_access_case(case_id));

revoke execute on function public.current_user_role() from public;
revoke execute on function public.ensure_user_profile() from public;
revoke execute on function public.can_access_case(uuid) from public;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.ensure_user_profile() to authenticated;
grant execute on function public.can_access_case(uuid) to authenticated;
