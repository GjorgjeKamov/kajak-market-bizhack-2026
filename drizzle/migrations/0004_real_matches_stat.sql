CREATE OR REPLACE VIEW public.aggregate_stats AS
SELECT (SELECT count(*) FROM producers WHERE NOT producers.is_test) AS producers,
  (SELECT count(*) FROM producers WHERE NOT producers.is_test AND producers.status = 'approved') AS approved_producers,
  (SELECT count(*) FROM products p JOIN producers r ON r.id = p.producer_id WHERE NOT r.is_test) AS products,
  (SELECT count(*) FROM buyers WHERE NOT buyers.is_test) AS buyers,
  (SELECT count(*) FROM buyer_requests q JOIN buyers b ON b.id = q.buyer_id WHERE NOT b.is_test) AS buyer_requests,
  (SELECT count(*) FROM match_events m JOIN producers r ON r.id = m.producer_id JOIN buyer_requests q ON q.id = m.buyer_request_id JOIN buyers b ON b.id = q.buyer_id WHERE NOT r.is_test AND NOT b.is_test) AS matches,
  (SELECT coalesce(round(avg(seconds)),0)::int FROM registration_metrics WHERE mode='sell') AS avg_seller_seconds,
  (SELECT coalesce(round(avg(seconds)),0)::int FROM registration_metrics WHERE mode='buy') AS avg_buyer_seconds;