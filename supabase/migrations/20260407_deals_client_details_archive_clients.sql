-- Add deal-level client details, backfill from legacy clients,
-- archive legacy clients table, then drop it.

alter table if exists public.orders
  add column if not exists "clientContactPerson" text,
  add column if not exists "clientEmail" text,
  add column if not exists "clientPhone" text,
  add column if not exists "clientNotes" text;

-- Backfill deal-level client details from clients table when available.
do $$
begin
  if to_regclass('public.clients') is not null then
    update public.orders o
    set
      "clientContactPerson" = coalesce(o."clientContactPerson", c."contactPerson"),
      "clientEmail" = coalesce(o."clientEmail", c.email),
      "clientPhone" = coalesce(o."clientPhone", c.phone),
      "clientNotes" = coalesce(o."clientNotes", c.notes)
    from lateral (
      select c1."contactPerson", c1.email, c1.phone, c1.notes
      from public.clients c1
      where c1."businessName" = o."clientName"
      order by c1.id desc
      limit 1
    ) c;

    create table if not exists public.clients_archive as
      table public.clients;

    drop table if exists public.clients;
  end if;
end $$;
