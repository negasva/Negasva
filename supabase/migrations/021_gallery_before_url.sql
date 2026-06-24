-- Migration 021: before_url en gallery_items — habilita el slider antes/después.
--
-- Cada obra puede llevar opcionalmente la foto "antes" (original del cliente).
-- NULL = obra sin par antes/después (solo se muestra como imagen suelta).
-- La landing muestra un slider arrastrable con las obras que tengan ambas.
-- Idempotente.

ALTER TABLE public.gallery_items
  ADD COLUMN IF NOT EXISTS before_url text;
