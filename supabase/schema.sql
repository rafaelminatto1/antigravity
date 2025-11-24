-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- This triggers a profile creation on user sign up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for patients
create table patients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  date_of_birth date,
  phone text,
  email text,
  address text,
  diagnosis text,
  status text default 'active' check (status in ('active', 'discharged', 'inactive')),
  therapist_id uuid references profiles(id)
);

alter table patients enable row level security;

create policy "Patients are viewable by authenticated users." on patients
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert patients." on patients
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update patients." on patients
  for update using (auth.role() = 'authenticated');

-- Create a table for appointments
create table appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  patient_id uuid references patients(id) not null,
  therapist_id uuid references profiles(id) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes text
);

alter table appointments enable row level security;

create policy "Appointments are viewable by authenticated users." on appointments
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert appointments." on appointments
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update appointments." on appointments
  for update using (auth.role() = 'authenticated');
