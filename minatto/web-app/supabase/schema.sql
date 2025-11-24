
-- Create a table for notebooks
create table notebooks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text,
  owner_id uuid references profiles(id) not null
);

alter table notebooks enable row level security;

create policy "Notebooks are viewable by owner." on notebooks
  for select using (auth.uid() = owner_id);

create policy "Users can insert their own notebooks." on notebooks
  for insert with check (auth.uid() = owner_id);

create policy "Users can update their own notebooks." on notebooks
  for update using (auth.uid() = owner_id);

create policy "Users can delete their own notebooks." on notebooks
  for delete using (auth.uid() = owner_id);

-- Create a table for projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  status text default 'active' check (status in ('active', 'completed', 'archived')),
  owner_id uuid references profiles(id) not null
);

alter table projects enable row level security;

create policy "Projects are viewable by owner." on projects
  for select using (auth.uid() = owner_id);

create policy "Users can insert their own projects." on projects
  for insert with check (auth.uid() = owner_id);

create policy "Users can update their own projects." on projects
  for update using (auth.uid() = owner_id);

-- Create a table for tasks (Kanban)
create table tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in-progress', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date timestamp with time zone,
  assignee_id uuid references profiles(id)
);

alter table tasks enable row level security;

create policy "Tasks are viewable by project owner." on tasks
  for select using (
    exists (
      select 1 from projects
      where projects.id = tasks.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Users can insert tasks in their projects." on tasks
  for insert with check (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Users can update tasks in their projects." on tasks
  for update using (
    exists (
      select 1 from projects
      where projects.id = tasks.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Users can delete tasks in their projects." on tasks
  for delete using (
    exists (
      select 1 from projects
      where projects.id = tasks.project_id
      and projects.owner_id = auth.uid()
    )
  );

-- Create a table for financial transactions
create table transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  description text not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')) not null,
  category text,
  date date not null,
  status text default 'completed' check (status in ('pending', 'completed', 'cancelled')),
  owner_id uuid references profiles(id) not null
);

alter table transactions enable row level security;

create policy "Transactions are viewable by owner." on transactions
  for select using (auth.uid() = owner_id);

create policy "Users can insert their own transactions." on transactions
  for insert with check (auth.uid() = owner_id);

create policy "Users can update their own transactions." on transactions
  for update using (auth.uid() = owner_id);
