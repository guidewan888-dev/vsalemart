-- Keep unpaid inventory reservations bounded without exposing a service-role key.
create extension if not exists pg_cron;

select cron.schedule(
  'expire-store-orders',
  '*/10 * * * *',
  $job$select public.expire_store_orders();$job$
);
