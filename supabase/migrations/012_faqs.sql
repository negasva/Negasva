-- Migration 012: FAQs table (admin-managed content for /faq)

CREATE TABLE IF NOT EXISTS public.faqs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question   text NOT NULL,
  answer     text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active faqs"
  ON public.faqs FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin manage faqs"
  ON public.faqs FOR ALL
  USING (is_admin());

-- Seed with the FAQs currently hardcoded in app/faq/page.tsx
INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('¿Cuánto tarda mi retrato?', 'La entrega estándar es de 48 horas o menos. Con la opción exprés 24h (+30%), saltas la cola y lo recibes al día siguiente.', 1),
  ('¿Qué formatos recibo?', 'PNG y JPG en alta resolución, listos para imprimir o publicar en redes sociales. Si necesitas un tamaño específico, díganos en las notas.', 2),
  ('¿Puedo pedir cambios después de recibirlo?', 'Sí. Tienes 24 horas tras la entrega para solicitar ajustes. Los retoques menores (color de pelo, accesorio, expresión) están incluidos sin costo.', 3),
  ('¿Cómo funciona el descuento por pack familia?', 'Automático: 3 personas o más obtienen 15% off, 5 o más obtienen 25% off. Solo añade gente en el paso 2 y verás el descuento aplicado.', 4),
  ('¿Qué pasa si la foto no es de buena calidad?', 'Te contactamos antes de empezar. Si la foto no permite un buen resultado, te pedimos otra o devolvemos el pago completo. Sin compromiso.', 5),
  ('¿Aceptan otras divisas?', 'Sí: USD, EUR, GBP, MXN, CAD y COP. Detectamos tu país automáticamente y puedes cambiar la divisa con el selector arriba.', 6),
  ('¿Puedo regalar un retrato?', 'Sí. Compra normalmente y úsalo como regalo. Pronto vamos a tener tarjetas regalo con código por email.', 7),
  ('¿Cómo pago? ¿Es seguro?', 'Procesamos pagos con Stripe (tarjeta, Apple Pay, Google Pay). Nunca vemos los datos de tu tarjeta. Pago 100% seguro.', 8),
  ('¿Puedo usar mi retrato comercialmente?', 'Tu retrato es para uso personal (redes, regalos, decoración). Para uso comercial, escríbenos a hola@negasva.com y armamos una licencia.', 9),
  ('¿Hago seguimiento de mi pedido?', 'Sí, en la página de [seguimiento](/seguimiento) con tu ID de pedido y email.', 10)
ON CONFLICT DO NOTHING;
