-- cloudflare_protect_logs に error_details カラムを追加
alter table cloudflare_protect_logs
  add column if not exists error_details jsonb;
