ALTER TABLE public.privacy_requests ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.privacy_requests ADD COLUMN IF NOT EXISTS email text, ADD COLUMN IF NOT EXISTS session_hash text;
ALTER TABLE public.privacy_requests DROP CONSTRAINT privacy_requests_request_type_check;
ALTER TABLE public.privacy_requests ADD CONSTRAINT privacy_requests_request_type_check CHECK (request_type = ANY (ARRAY['withdraw_consent','correction','deletion','access_portability']));
ALTER TABLE public.privacy_requests ADD CONSTRAINT privacy_requests_contact_check CHECK (
  (phone IS NOT NULL AND phone ~ '^\+?[0-9 ()-]{7,20}$') OR (email IS NOT NULL AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'));