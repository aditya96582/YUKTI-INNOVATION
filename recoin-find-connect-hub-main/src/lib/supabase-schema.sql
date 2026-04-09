-- Run this in Supabase Dashboard → SQL Editor

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  location text default '',
  tokens integer default 10,
  reputation numeric default 0,
  total_helps integer default 0,
  badges text[] default '{}',
  bio text default '',
  phone text default '',
  joined_date date default now(),
  token_history jsonb default '[]',
  created_at timestamptz default now()
);

-- Lost Items
create table if not exists lost_items (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  date date not null,
  image text,
  reward integer default 0,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  status text default 'active' check (status in ('active','matched','resolved')),
  ai_generated boolean default false,
  created_at timestamptz default now()
);

-- Found Items
create table if not exists found_items (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  date date not null,
  image text,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  status text default 'active' check (status in ('active','matched','resolved')),
  created_at timestamptz default now()
);

-- AI Matches
create table if not exists ai_matches (
  id text primary key default gen_random_uuid()::text,
  lost_item_id text references lost_items(id) on delete cascade,
  found_item_id text references found_items(id) on delete cascade,
  confidence integer not null,
  match_type text check (match_type in ('text','image','hybrid')),
  lost_title text,
  found_title text,
  reasons text[] default '{}',
  created_at timestamptz default now()
);

-- Emergency Requests
create table if not exists emergencies (
  id text primary key default gen_random_uuid()::text,
  type text check (type in ('blood','sos','accident')),
  title text not null,
  description text not null,
  location text not null,
  urgency text check (urgency in ('low','medium','critical')),
  blood_type text,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  status text default 'active' check (status in ('active','responded','resolved')),
  responders integer default 0,
  created_at timestamptz default now()
);

-- Medical Requests
create table if not exists medical_requests (
  id text primary key default gen_random_uuid()::text,
  medicines jsonb not null,
  prescription_image text,
  location text not null,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text not null,
  status text default 'pending' check (status in ('pending','notified','matched','fulfilled')),
  pharmacy_responses jsonb default '[]',
  accepted_pharmacy text,
  delivery_mode text check (delivery_mode in ('pickup','delivery')),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table lost_items enable row level security;
alter table found_items enable row level security;
alter table ai_matches enable row level security;
alter table emergencies enable row level security;
alter table medical_requests enable row level security;

-- RLS Policies: public read, authenticated write
create policy "Public read profiles" on profiles for select using (true);
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);

create policy "Public read lost items" on lost_items for select using (true);
create policy "Auth users insert lost items" on lost_items for insert with check (auth.uid() = user_id);
create policy "Users update own lost items" on lost_items for update using (auth.uid() = user_id);

create policy "Public read found items" on found_items for select using (true);
create policy "Auth users insert found items" on found_items for insert with check (auth.uid() = user_id);
create policy "Users update own found items" on found_items for update using (auth.uid() = user_id);

create policy "Public read matches" on ai_matches for select using (true);
create policy "Auth users insert matches" on ai_matches for insert with check (auth.uid() is not null);

create policy "Public read emergencies" on emergencies for select using (true);
create policy "Auth users insert emergencies" on emergencies for insert with check (auth.uid() = user_id);
create policy "Auth users update emergencies" on emergencies for update using (true);

create policy "Public read medical" on medical_requests for select using (true);
create policy "Auth users insert medical" on medical_requests for insert with check (auth.uid() = user_id);
create policy "Auth users update medical" on medical_requests for update using (true);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
