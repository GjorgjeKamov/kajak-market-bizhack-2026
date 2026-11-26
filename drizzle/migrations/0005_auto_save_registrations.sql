ALTER TABLE public.producers
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN location DROP NOT NULL,
  ALTER COLUMN full_name DROP NOT NULL,
  ADD COLUMN session_hash text UNIQUE,
  ADD COLUMN registration_status text NOT NULL DEFAULT 'incomplete',
  ADD COLUMN missing_fields text[] NOT NULL DEFAULT '{}',
  ADD COLUMN completed_at timestamptz,
  ADD COLUMN last_activity_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.buyers
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN full_name DROP NOT NULL,
  ADD COLUMN session_hash text UNIQUE,
  ADD COLUMN registration_status text NOT NULL DEFAULT 'incomplete',
  ADD COLUMN missing_fields text[] NOT NULL DEFAULT '{}',
  ADD COLUMN completed_at timestamptz,
  ADD COLUMN last_activity_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.registration_metrics ADD COLUMN is_test boolean NOT NULL DEFAULT false;

-- Backfill: every existing registration was saved only after explicit confirmation.
UPDATE public.producers SET registration_status = 'completed', completed_at = created_at, last_activity_at = created_at;
UPDATE public.buyers SET registration_status = 'completed', completed_at = created_at, last_activity_at = created_at;
-- The only existing metric has no matching real registration (automated/test run).
UPDATE public.registration_metrics SET is_test = true;

-- Legacy path (published site, no session): only fully confirmed registrations with required fields; marked completed.
CREATE OR REPLACE FUNCTION public.producer_registration_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.session_hash IS NULL THEN
    IF coalesce(trim(NEW.full_name), '') = '' OR coalesce(trim(NEW.phone), '') = '' OR coalesce(trim(NEW.location), '') = '' THEN
      RAISE EXCEPTION 'Missing required registration fields';
    END IF;
    NEW.registration_status := 'completed';
    NEW.completed_at := coalesce(NEW.completed_at, now());
  END IF;
  IF NEW.status = 'approved' AND NEW.registration_status <> 'completed' THEN
    RAISE EXCEPTION 'Only completed registrations can be approved';
  END IF;
  RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.buyer_registration_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.session_hash IS NULL THEN
    IF coalesce(trim(NEW.full_name), '') = '' OR coalesce(trim(NEW.phone), '') = '' THEN
      RAISE EXCEPTION 'Missing required registration fields';
    END IF;
    NEW.registration_status := 'completed';
    NEW.completed_at := coalesce(NEW.completed_at, now());
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER producers_registration_guard BEFORE INSERT OR UPDATE ON public.producers FOR EACH ROW EXECUTE FUNCTION public.producer_registration_guard();
CREATE TRIGGER buyers_registration_guard BEFORE INSERT ON public.buyers FOR EACH ROW EXECUTE FUNCTION public.buyer_registration_guard();

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all" ON public.app_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
INSERT INTO public.app_settings(key, value) VALUES ('abandoned_retention_days', '30');

-- Removes only INCOMPLETE registrations inactive longer than the retention period. Admins or service role only. Not executed here.
CREATE OR REPLACE FUNCTION public.purge_abandoned_registrations()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d int; n int := 0; m int;
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' AND NOT coalesce(has_role(auth.uid(), 'admin'), false) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT (value #>> '{}')::int INTO d FROM app_settings WHERE key = 'abandoned_retention_days';
  d := greatest(coalesce(d, 30), 1);
  DELETE FROM consent_records c USING producers p WHERE c.subject_type = 'producer' AND c.subject_id = p.id AND p.registration_status = 'incomplete' AND p.last_activity_at < now() - make_interval(days => d);
  DELETE FROM producers WHERE registration_status = 'incomplete' AND last_activity_at < now() - make_interval(days => d);
  GET DIAGNOSTICS m = ROW_COUNT; n := n + m;
  DELETE FROM consent_records c USING buyers b WHERE c.subject_type = 'buyer' AND c.subject_id = b.id AND b.registration_status = 'incomplete' AND b.last_activity_at < now() - make_interval(days => d);
  DELETE FROM buyers WHERE registration_status = 'incomplete' AND last_activity_at < now() - make_interval(days => d);
  GET DIAGNOSTICS m = ROW_COUNT; n := n + m;
  RETURN n;
END $$;
REVOKE EXECUTE ON FUNCTION public.purge_abandoned_registrations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purge_abandoned_registrations() TO authenticated, service_role;

CREATE OR REPLACE VIEW public.aggregate_stats WITH (security_invoker = on) AS
 SELECT ( SELECT count(*) FROM producers WHERE NOT is_test AND registration_status = 'completed') AS producers,
    ( SELECT count(*) FROM producers WHERE NOT is_test AND registration_status = 'completed' AND status = 'approved') AS approved_producers,
    ( SELECT count(*) FROM products p JOIN producers r ON r.id = p.producer_id WHERE NOT r.is_test AND r.registration_status = 'completed') AS products,
    ( SELECT count(*) FROM buyers WHERE NOT is_test AND registration_status = 'completed') AS buyers,
    ( SELECT count(*) FROM buyer_requests q JOIN buyers b ON b.id = q.buyer_id WHERE NOT b.is_test AND b.registration_status = 'completed') AS buyer_requests,
    ( SELECT count(*) FROM match_events m JOIN producers r ON r.id = m.producer_id JOIN buyer_requests q ON q.id = m.buyer_request_id JOIN buyers b ON b.id = q.buyer_id WHERE NOT r.is_test AND NOT b.is_test) AS matches,
    ( SELECT COALESCE(round(avg(seconds)), 0)::integer FROM registration_metrics WHERE mode = 'sell' AND NOT is_test) AS avg_seller_seconds,
    ( SELECT COALESCE(round(avg(seconds)), 0)::integer FROM registration_metrics WHERE mode = 'buy' AND NOT is_test) AS avg_buyer_seconds,
    ( SELECT count(*) FROM producers WHERE NOT is_test AND registration_status = 'incomplete') AS incomplete_producers,
    ( SELECT count(*) FROM buyers WHERE NOT is_test AND registration_status = 'incomplete') AS incomplete_buyers;