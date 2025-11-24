-- ============================================================================
-- KNOWLEDGE BASE SYSTEM (Gemini File Search Integration)
-- ============================================================================

-- Create a table for knowledge base documents
create table if not exists knowledge_documents (
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
  gemini_file_id text,
  gemini_store_id text not null,
  gemini_import_status text default 'pending' check (gemini_import_status in ('pending', 'processing', 'completed', 'failed')),
  gemini_error text,
  
  -- Organization and permissions
  category text,
  tags text[],
  allowed_roles text[] default '{authenticated}',
  
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

drop policy if exists "Knowledge documents viewable by authenticated users." on knowledge_documents;
create policy "Knowledge documents viewable by authenticated users." on knowledge_documents
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert knowledge documents." on knowledge_documents;
create policy "Authenticated users can insert knowledge documents." on knowledge_documents
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update knowledge documents." on knowledge_documents;
create policy "Authenticated users can update knowledge documents." on knowledge_documents
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete knowledge documents." on knowledge_documents;
create policy "Authenticated users can delete knowledge documents." on knowledge_documents
  for delete using (auth.role() = 'authenticated');

-- Indexes for performance
create index if not exists idx_knowledge_documents_category on knowledge_documents(category);
create index if not exists idx_knowledge_documents_tags on knowledge_documents using gin(tags);
create index if not exists idx_knowledge_documents_gemini_store on knowledge_documents(gemini_store_id);
create index if not exists idx_knowledge_documents_status on knowledge_documents(gemini_import_status);

-- Create a table for search history (analytics)
create table if not exists knowledge_search_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles(id) not null,
  query text not null,
  results_count integer,
  clicked_document_id uuid references knowledge_documents(id)
);

-- RLS Policies for knowledge_search_history
alter table knowledge_search_history enable row level security;

drop policy if exists "Users can view their own search history." on knowledge_search_history;
create policy "Users can view their own search history." on knowledge_search_history
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own search history." on knowledge_search_history;
create policy "Users can insert their own search history." on knowledge_search_history
  for insert with check (auth.uid() = user_id);
