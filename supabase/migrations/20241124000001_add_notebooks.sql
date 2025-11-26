-- Create a table for notebooks
create table notebooks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Notebook content
  title text not null,
  content text default '',
  
  -- Organization
  user_id uuid references profiles(id) on delete cascade,
  tags text[], -- Array of tags for organization
  
  -- Metadata
  is_favorite boolean default false,
  is_archived boolean default false
);

-- Set up Row Level Security (RLS)
alter table notebooks enable row level security;

-- Policies: Users can only see and manage their own notebooks
create policy "Users can view their own notebooks." on notebooks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own notebooks." on notebooks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own notebooks." on notebooks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notebooks." on notebooks
  for delete using (auth.uid() = user_id);

-- Indexes for performance
create index idx_notebooks_user_id on notebooks(user_id);
create index idx_notebooks_updated_at on notebooks(updated_at desc);
create index idx_notebooks_tags on notebooks using gin(tags);

-- Function to automatically update updated_at timestamp
create or replace function update_notebooks_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to call the function
create trigger notebooks_updated_at_trigger
  before update on notebooks
  for each row
  execute function update_notebooks_updated_at();
