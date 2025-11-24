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

-- ============================================================================
-- KNOWLEDGE BASE SYSTEM (Gemini File Search Integration)
-- ============================================================================

-- Create a table for knowledge base documents
create table knowledge_documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- File metadata
  title text not null,
  description text,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  
  -- Supabase Storage
  storage_path text not null,
  storage_bucket text default 'knowledge-base' not null,
  
  -- Gemini File Search integration
  gemini_file_id text, -- Temporary file ID (valid for 48h)
  gemini_store_id text not null, -- FileSearchStore ID
  gemini_import_status text default 'pending' check (gemini_import_status in ('pending', 'processing', 'completed', 'failed')),
  gemini_error text,
  
  -- Organization and permissions
  category text, -- e.g., 'protocols', 'studies', 'manuals'
  tags text[], -- Array of tags for search
  allowed_roles text[] default '{authenticated}', -- Roles that can access
  
  -- Audit
  uploaded_by uuid references profiles(id) not null,
  
  constraint valid_file_type check (file_type in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ))
);

-- RLS Policies for knowledge_documents
alter table knowledge_documents enable row level security;

create policy "Knowledge documents viewable by authenticated users." on knowledge_documents
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert knowledge documents." on knowledge_documents
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update knowledge documents." on knowledge_documents
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete knowledge documents." on knowledge_documents
  for delete using (auth.role() = 'authenticated');

-- Indexes for performance
create index idx_knowledge_documents_category on knowledge_documents(category);
create index idx_knowledge_documents_tags on knowledge_documents using gin(tags);
create index idx_knowledge_documents_gemini_store on knowledge_documents(gemini_store_id);
create index idx_knowledge_documents_status on knowledge_documents(gemini_import_status);

-- Create a table for search history (analytics)
create table knowledge_search_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles(id) not null,
  query text not null,
  results_count integer,
  clicked_document_id uuid references knowledge_documents(id)
);

-- RLS Policies for knowledge_search_history
alter table knowledge_search_history enable row level security;

create policy "Users can view their own search history." on knowledge_search_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own search history." on knowledge_search_history
  for insert with check (auth.uid() = user_id);

