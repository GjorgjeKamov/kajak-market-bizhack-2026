CREATE TABLE public.legal_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc text NOT NULL CHECK (doc IN ('privacy','terms','consent')),
  lang text NOT NULL CHECK (lang ~ '^[a-z]{2}$'),
  version text NOT NULL,
  content jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved')),
  approved_at timestamptz,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doc, lang, version)
);
GRANT SELECT ON public.legal_translations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_translations TO authenticated;
GRANT ALL ON public.legal_translations TO service_role;
ALTER TABLE public.legal_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads approved" ON public.legal_translations FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Admins manage" ON public.legal_translations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));