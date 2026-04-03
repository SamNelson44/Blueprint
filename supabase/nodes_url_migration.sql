-- ============================================================
--  BLUEPRINT — Nodes URL Migration
--  Run in: Supabase Dashboard → SQL Editor → New Query
--  Adds a url column to nodes for video embeds and link nodes.
-- ============================================================

ALTER TABLE public.nodes
  ADD COLUMN IF NOT EXISTS url TEXT;
