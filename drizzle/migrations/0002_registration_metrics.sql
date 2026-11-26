CREATE TABLE public.registration_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL CHECK (mode IN ('sell','buy')),
  seconds integer NOT NULL CHECK (seconds >= 0),
  turns integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.registration_metrics TO authenticated;
GRANT ALL ON public.registration_metrics TO service_role;
ALTER TABLE public.registration_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read metrics" ON public.registration_metrics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.aggregate_stats AS
SELECT (SELECT count(*) FROM producers WHERE NOT producers.is_test) AS producers,
  (SELECT count(*) FROM producers WHERE NOT producers.is_test AND producers.status = 'approved') AS approved_producers,
  (SELECT count(*) FROM products p JOIN producers r ON r.id = p.producer_id WHERE NOT r.is_test) AS products,
  (SELECT count(*) FROM buyers WHERE NOT buyers.is_test) AS buyers,
  (SELECT count(*) FROM buyer_requests q JOIN buyers b ON b.id = q.buyer_id WHERE NOT b.is_test) AS buyer_requests,
  (SELECT count(*) FROM match_events) AS matches,
  (SELECT coalesce(round(avg(seconds)),0)::int FROM registration_metrics WHERE mode='sell') AS avg_seller_seconds,
  (SELECT coalesce(round(avg(seconds)),0)::int FROM registration_metrics WHERE mode='buy') AS avg_buyer_seconds;