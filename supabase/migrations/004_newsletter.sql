-- Newsletter subscribers captured by the email-capture popup
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  source VARCHAR(50),
  coupon_code VARCHAR(50) DEFAULT 'BIENVENIDA10',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous signups from the popup)
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- No public reads
CREATE POLICY "No public reads"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (false);
