-- Migration 016: footer editable desde el panel de admin (key 'footer' en landing_config)

INSERT INTO public.landing_config (key, value) VALUES
('footer', '{
  "tagline_es": "Retratos personalizados de calidad profesional",
  "tagline_en": "Professional quality custom portraits",
  "social": [
    {"label": "Instagram", "url": "https://instagram.com/negasva"},
    {"label": "TikTok", "url": "https://tiktok.com/@negasva"}
  ],
  "columns": [
    {"title_es": "Producto", "title_en": "Product", "links": [
      {"label_es": "Estilos", "label_en": "Styles", "href": "/estilos"},
      {"label_es": "Precios", "label_en": "Pricing", "href": "/precios"},
      {"label_es": "Galería", "label_en": "Gallery", "href": "/galeria"},
      {"label_es": "Seguimiento", "label_en": "Tracking", "href": "/seguimiento"}
    ]},
    {"title_es": "Empresa", "title_en": "Company", "links": [
      {"label_es": "Sobre", "label_en": "About", "href": "/sobre"},
      {"label_es": "Blog", "label_en": "Blog", "href": "/blog"},
      {"label_es": "Contacto", "label_en": "Contact", "href": "/contacto"},
      {"label_es": "FAQ", "label_en": "FAQ", "href": "/faq"}
    ]},
    {"title_es": "Legal", "title_en": "Legal", "links": [
      {"label_es": "Privacidad", "label_en": "Privacy", "href": "/privacidad"},
      {"label_es": "Términos", "label_en": "Terms", "href": "/terminos"},
      {"label_es": "Cookies", "label_en": "Cookies", "href": "/cookies"}
    ]}
  ]
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
