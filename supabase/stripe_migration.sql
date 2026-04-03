-- ============================================================
--  BLUEPRINT — Stripe Migration
--  Run in: Supabase Dashboard → SQL Editor → New Query
--  Run AFTER schema.sql (adds Stripe fields to enrollments)
-- ============================================================

-- Add stripe_session_id for idempotency.
-- The webhook uses this to guarantee exactly-once enrollment
-- even if Stripe delivers the event more than once.
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE;

-- Index for the idempotency lookup in the webhook handler.
CREATE INDEX IF NOT EXISTS idx_enrollments_stripe_session
  ON public.enrollments (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Free enrollments leave stripe_session_id NULL — that's expected.
-- The UNIQUE constraint only applies to non-NULL values in Postgres,
-- so multiple free enrollments on different blueprints are fine.
