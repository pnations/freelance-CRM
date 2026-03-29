-- Add optional fields used by the unified Payments + Hours workflow.
-- Safe to run multiple times.

alter table public.payments
  add column if not exists hours numeric,
  add column if not exists comment text;
