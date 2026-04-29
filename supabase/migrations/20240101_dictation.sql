-- dictation_logs: stores transcripts and parsed field output for audit purposes

create table if not exists public.dictation_logs (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references public.projects(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete set null,
  section       smallint not null check (section between 1 and 4),
  transcript    text not null,
  parsed_fields jsonb not null default '{}',
  audio_path    text,
  created_at    timestamptz not null default now()
);

create index dictation_logs_project_id_idx on public.dictation_logs (project_id);
create index dictation_logs_user_id_idx on public.dictation_logs (user_id);

alter table public.dictation_logs enable row level security;

create policy "Users can read own dictation logs"
  on public.dictation_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own dictation logs"
  on public.dictation_logs for insert
  with check (auth.uid() = user_id);

-- Storage bucket for audio recordings (optional audit trail)

insert into storage.buckets (id, name, public)
values ('dictations', 'dictations', false)
on conflict do nothing;

create policy "Users can upload own recordings"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'dictations' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own recordings"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'dictations' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
