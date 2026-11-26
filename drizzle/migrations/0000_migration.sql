create type public.app_role as enum ('admin');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role public.app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role public.app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create table public.producers (
 id uuid primary key default gen_random_uuid(), full_name text not null, country text not null default 'Macedonia', location text not null,
 producer_type text, phone text not null, email text, email_active boolean, phone_public_consent boolean not null default false,
 buyer_contact_ack boolean not null default false, free_delivery boolean, free_delivery_areas text, paid_delivery_macedonia boolean,
 export_capability text, language text, status text not null default 'pending' check (status in ('pending','approved','deactivated')),
 is_test boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.products (
 id uuid primary key default gen_random_uuid(), producer_id uuid not null references public.producers(id) on delete cascade,
 name text not null, production_quantity numeric, available_quantity numeric, unit text, season text, price numeric, currency text, price_unit text,
 negotiable boolean, created_at timestamptz not null default now());
create table public.buyers (
 id uuid primary key default gen_random_uuid(), full_name text not null, country text not null default 'Macedonia', location text,
 business_name text, buyer_type text, phone text not null, email text, contact_share_consent boolean not null default false, language text,
 is_test boolean not null default false, created_at timestamptz not null default now());
create table public.buyer_requests (
 id uuid primary key default gen_random_uuid(), buyer_id uuid not null references public.buyers(id) on delete cascade,
 product text not null, quantity numeric, unit text, delivery_location text, delivery_period text, target_price numeric, currency text,
 recurring boolean, status text not null default 'open', created_at timestamptz not null default now());
create table public.consent_records (
 id uuid primary key default gen_random_uuid(), subject_type text not null check (subject_type in ('producer','buyer')), subject_id uuid not null,
 consent_type text not null, granted boolean not null, wording text not null, policy_version text not null, withdrawn_at timestamptz,
 created_at timestamptz not null default now());
create table public.feedback (id uuid primary key default gen_random_uuid(), source text, buyer_id uuid references public.buyers(id) on delete set null, message text not null, created_at timestamptz not null default now());
create table public.match_events (id uuid primary key default gen_random_uuid(), buyer_request_id uuid references public.buyer_requests(id) on delete cascade, producer_id uuid references public.producers(id) on delete cascade, product_id uuid references public.products(id) on delete cascade, score numeric, created_at timestamptz not null default now());
create table public.privacy_requests (id uuid primary key default gen_random_uuid(), phone text not null, request_type text not null check (request_type in ('withdraw_consent','correction','deletion')), details text, status text not null default 'open', created_at timestamptz not null default now());
create table public.rate_limits (key text primary key, count int not null default 0, window_start timestamptz not null default now());

do $$ declare t text; begin
 foreach t in array array['producers','products','buyers','buyer_requests','consent_records','feedback','match_events','privacy_requests'] loop
  execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  execute format('grant all on public.%I to service_role', t);
  execute format('alter table public.%I enable row level security', t);
  execute format('create policy "admin all" on public.%I for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))', t);
 end loop; end $$;
grant all on public.rate_limits to service_role; alter table public.rate_limits enable row level security;

create or replace view public.aggregate_stats with (security_invoker = true) as select
 (select count(*) from public.producers where not is_test) producers,
 (select count(*) from public.producers where not is_test and status='approved') approved_producers,
 (select count(*) from public.products p join public.producers r on r.id=p.producer_id where not r.is_test) products,
 (select count(*) from public.buyers where not is_test) buyers,
 (select count(*) from public.buyer_requests q join public.buyers b on b.id=q.buyer_id where not b.is_test) buyer_requests,
 (select count(*) from public.match_events) matches;
grant select on public.aggregate_stats to authenticated;

create or replace function public.hit_rate_limit(_key text, _max int, _window_seconds int) returns boolean language plpgsql security definer set search_path = public as $$
declare c int; begin
 insert into public.rate_limits(key,count,window_start) values(_key,1,now())
 on conflict(key) do update set count = case when rate_limits.window_start < now() - make_interval(secs=>_window_seconds) then 1 else rate_limits.count+1 end,
   window_start = case when rate_limits.window_start < now() - make_interval(secs=>_window_seconds) then now() else rate_limits.window_start end
 returning count into c;
 return c > _max; end $$;
revoke execute on function public.hit_rate_limit(text,int,int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text,int,int) to service_role;

create or replace function public.claim_first_admin() returns boolean language plpgsql security definer set search_path = public as $$
begin
 if auth.uid() is null then return false; end if;
 if exists(select 1 from public.user_roles where role='admin') then return public.has_role(auth.uid(),'admin'); end if;
 insert into public.user_roles(user_id, role) values (auth.uid(),'admin'); return true; end $$;
revoke execute on function public.claim_first_admin() from public, anon; grant execute on function public.claim_first_admin() to authenticated;