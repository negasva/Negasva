-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portrait_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can view and update their own
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: users can view and create their own
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own draft orders" ON public.orders;
CREATE POLICY "Users can update own draft orders"
  ON public.orders FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');

DROP POLICY IF EXISTS "Service role can update any order" ON public.orders;
CREATE POLICY "Service role can update any order"
  ON public.orders FOR UPDATE USING (auth.role() = 'service_role');

-- Order Images: users can view their own order's images
DROP POLICY IF EXISTS "Users can view own order images" ON public.order_images;
CREATE POLICY "Users can view own order images"
  ON public.order_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_images.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert images to their orders" ON public.order_images;
CREATE POLICY "Users can insert images to their orders"
  ON public.order_images FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_images.order_id AND orders.user_id = auth.uid())
  );

-- Transactions: users can view their own order transactions
DROP POLICY IF EXISTS "Users can view own order transactions" ON public.transactions;
CREATE POLICY "Users can view own order transactions"
  ON public.transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = transactions.order_id AND orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role can insert transactions" ON public.transactions;
CREATE POLICY "Service role can insert transactions"
  ON public.transactions FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can update transactions" ON public.transactions;
CREATE POLICY "Service role can update transactions"
  ON public.transactions FOR UPDATE USING (auth.role() = 'service_role');

-- Portrait Styles: everyone can view active styles
DROP POLICY IF EXISTS "Everyone can view active styles" ON public.portrait_styles;
CREATE POLICY "Everyone can view active styles"
  ON public.portrait_styles FOR SELECT USING (is_active = TRUE);

-- Backgrounds: everyone can view active backgrounds
DROP POLICY IF EXISTS "Everyone can view active backgrounds" ON public.backgrounds;
CREATE POLICY "Everyone can view active backgrounds"
  ON public.backgrounds FOR SELECT USING (is_active = TRUE);

-- Rate Limits: service role only
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits FOR ALL USING (auth.role() = 'service_role');

-- Analytics Events: service role only
DROP POLICY IF EXISTS "Service role can insert analytics" ON public.analytics_events;
CREATE POLICY "Service role can insert analytics"
  ON public.analytics_events FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Audit Logs: service role only
DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.audit_logs;
CREATE POLICY "Service role can manage audit logs"
  ON public.audit_logs FOR ALL USING (auth.role() = 'service_role');
