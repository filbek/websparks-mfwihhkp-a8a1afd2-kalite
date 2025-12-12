-- Create Survey Module Tables (Fixed types)

-- 1. Surveys Table
create table if not exists public.surveys (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null references public.organizations(id),
  created_by uuid not null references public.users(id),
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  start_date date,
  end_date date,
  is_anonymous boolean default false,
  target_type text not null default 'all' check (target_type in ('all', 'facility', 'department')),
  target_ids integer[] default null, -- Fixed: Integer array for Facility/Dept IDs
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Survey Questions Table
create table if not exists public.survey_questions (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid not null references public.surveys(id) on delete cascade,
  question_text text not null,
  question_type text not null check (question_type in ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'rating')),
  options jsonb,
  is_required boolean default true,
  "order" integer not null default 0,
  created_at timestamptz default now()
);

-- 3. Survey Responses Table
create table if not exists public.survey_responses (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid not null references public.surveys(id) on delete cascade,
  user_id uuid not null references public.users(id),
  submitted_at timestamptz default now(),
  unique(survey_id, user_id)
);

-- 4. Survey Answers Table
create table if not exists public.survey_answers (
  id uuid default gen_random_uuid() primary key,
  response_id uuid not null references public.survey_responses(id) on delete cascade,
  question_id uuid not null references public.survey_questions(id) on delete cascade,
  answer_text text,
  answer_value jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_responses enable row level security;
alter table public.survey_answers enable row level security;

-- Policies

-- Surveys:
create policy "View Surveys" on public.surveys
  for select to authenticated
  using (
    (
      exists (
        select 1 from public.users u 
        where u.id = auth.uid() 
        and u.organization_id = surveys.organization_id
        and ('admin' = any(u.role) or 'merkez_kalite' = any(u.role) or 'sube_kalite' = any(u.role) or 'system_admin' = any(u.role))
      )
    )
    OR
    (
      status = 'published'
      and organization_id = (select organization_id from public.users where id = auth.uid())
      and (
        target_type = 'all'
        or (target_type = 'facility' and (select facility_id from public.users where id = auth.uid()) = any(target_ids))
        or (target_type = 'department' and (select department_id from public.users where id = auth.uid()) = any(target_ids))
      )
    )
  );

create policy "Manage Surveys" on public.surveys
  for all to authenticated
  using (
      exists (
        select 1 from public.users u 
        where u.id = auth.uid() 
        and u.organization_id = surveys.organization_id
        and ('admin' = any(u.role) or 'merkez_kalite' = any(u.role) or 'sube_kalite' = any(u.role) or 'system_admin' = any(u.role))
      )
  );

-- Questions:
create policy "View Questions" on public.survey_questions
  for select to authenticated
  using (
    exists (select 1 from public.surveys s where s.id = survey_questions.survey_id)
  );

create policy "Manage Questions" on public.survey_questions
  for all to authenticated
  using (
    exists (
      select 1 from public.surveys s 
      join public.users u on s.organization_id = u.organization_id
      where s.id = survey_questions.survey_id
      and u.id = auth.uid()
      and ('admin' = any(u.role) or 'merkez_kalite' = any(u.role) or 'sube_kalite' = any(u.role) or 'system_admin' = any(u.role))
    )
  );

-- Responses:
create policy "View Responses" on public.survey_responses
  for select to authenticated
  using (
    user_id = auth.uid()
    or
    exists (
      select 1 from public.surveys s
      join public.users u on s.organization_id = u.organization_id
      where s.id = survey_responses.survey_id
      and u.id = auth.uid()
      and ('admin' = any(u.role) or 'merkez_kalite' = any(u.role) or 'sube_kalite' = any(u.role) or 'system_admin' = any(u.role))
    )
  );

create policy "Create Response" on public.survey_responses
  for insert to authenticated
  with check (
    user_id = auth.uid()
  );

-- Answers:
create policy "View Answers" on public.survey_answers
  for select to authenticated
  using (
    exists (select 1 from public.survey_responses r where r.id = survey_answers.response_id)
  );

create policy "Create Answers" on public.survey_answers
  for insert to authenticated
  with check (
     exists (select 1 from public.survey_responses r where r.id = survey_answers.response_id and r.user_id = auth.uid())
  );
