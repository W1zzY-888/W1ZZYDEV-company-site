-- Retention/archive/delete scaffolding. No cron. Dry-run first.

create table if not exists public.data_retention_actions (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  entity_hash text,
  dry_run boolean not null default true,
  result text not null,
  created_at timestamptz not null default now(),
  actor_id uuid,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.data_retention_actions enable row level security;
revoke all on public.data_retention_actions from anon, authenticated;
grant select on public.data_retention_actions to authenticated;

drop policy if exists "owner reads retention actions" on public.data_retention_actions;
create policy "owner reads retention actions" on public.data_retention_actions
for select to authenticated using (public.is_owner());

create or replace function public.retention_archive_conversations(p_before timestamptz, p_limit integer, p_dry_run boolean default true)
returns table(conversation_id uuid, planned_action text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_owner() then raise exception 'Owner only'; end if;
  if p_limit is null or p_limit < 1 or p_limit > 100 then raise exception 'Limit must be 1..100'; end if;
  return query
    select c.id, case when p_dry_run then 'dry_run_archive' else 'archive' end
    from public.conversations c
    where c.updated_at < p_before and c.archived_at is null and c.deleted_at is null
    order by c.updated_at
    limit p_limit;
  if not p_dry_run then
    update public.conversations c
      set archived_at = now(), archived_by = 'owner', updated_at = now()
      where c.id in (
        select c2.id from public.conversations c2
        where c2.updated_at < p_before and c2.archived_at is null and c2.deleted_at is null
        order by c2.updated_at limit p_limit
      );
  end if;
end;
$$;

revoke execute on function public.retention_archive_conversations(timestamptz,integer,boolean) from public, anon, authenticated;
grant execute on function public.retention_archive_conversations(timestamptz,integer,boolean) to authenticated;
