-- ============================================================
--  BLUEPRINT — Supabase SQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--  Order matters — run top to bottom exactly once.
-- ============================================================


-- ============================================================
--  EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
--  ENUMS
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('expert', 'learner');
CREATE TYPE public.node_type  AS ENUM ('video', 'task', 'link');


-- ============================================================
--  TABLES
-- ============================================================

-- ----------------------------------------------------------
--  profiles
--  One row per auth user. Created automatically on sign-up
--  via the handle_new_user trigger below.
-- ----------------------------------------------------------
CREATE TABLE public.profiles (
  id           UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         user_role    NOT NULL DEFAULT 'learner',
  full_name    TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
--  blueprints
-- ----------------------------------------------------------
CREATE TABLE public.blueprints (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id   UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT         NOT NULL CHECK (char_length(title) BETWEEN 3 AND 100),
  slug         TEXT         NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description  TEXT         NOT NULL DEFAULT '',
  price        NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_published BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
--  nodes
-- ----------------------------------------------------------
CREATE TABLE public.nodes (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  blueprint_id      UUID        NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  order_index       INTEGER     NOT NULL DEFAULT 0 CHECK (order_index >= 0),
  title             TEXT        NOT NULL DEFAULT '',
  content_markdown  TEXT        NOT NULL DEFAULT '',
  type              node_type   NOT NULL DEFAULT 'task',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
--  enrollments
--  Represents a user having "purchased" or been granted
--  access to a blueprint.
-- ----------------------------------------------------------
CREATE TABLE public.enrollments (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blueprint_id  UUID        NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, blueprint_id)
);

-- ----------------------------------------------------------
--  user_progress
--  One row per (user, node). Upserted on conflict.
-- ----------------------------------------------------------
CREATE TABLE public.user_progress (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_id       UUID        NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  is_completed  BOOLEAN     NOT NULL DEFAULT TRUE,
  completed_at  TIMESTAMPTZ,

  UNIQUE (user_id, node_id)
);


-- ============================================================
--  INDEXES
--  Covering the most common query patterns in the app.
-- ============================================================

-- Blueprint lookups
CREATE INDEX idx_blueprints_creator_id  ON public.blueprints (creator_id);
CREATE INDEX idx_blueprints_slug        ON public.blueprints (slug);
CREATE INDEX idx_blueprints_published   ON public.blueprints (is_published) WHERE is_published = TRUE;

-- Node ordering within a blueprint
CREATE INDEX idx_nodes_blueprint_order  ON public.nodes (blueprint_id, order_index);

-- Enrollment checks (the most frequent auth query)
CREATE INDEX idx_enrollments_user       ON public.enrollments (user_id);
CREATE INDEX idx_enrollments_blueprint  ON public.enrollments (blueprint_id);

-- Progress lookups per user per blueprint (via node join)
CREATE INDEX idx_progress_user          ON public.user_progress (user_id);
CREATE INDEX idx_progress_node          ON public.user_progress (node_id);


-- ============================================================
--  FUNCTIONS & TRIGGERS
-- ============================================================

-- ----------------------------------------------------------
--  updated_at — auto-stamp on every row update
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_blueprints_updated_at
  BEFORE UPDATE ON public.blueprints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_nodes_updated_at
  BEFORE UPDATE ON public.nodes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------
--  handle_new_user — create a profile row on sign-up
--  Fires automatically when Supabase Auth creates a user.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------
--  slugify — helper to generate a URL-safe slug from text.
--  Usage: SELECT public.slugify('My Blueprint Title!');
--  →      'my-blueprint-title'
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(input),
        '[^a-zA-Z0-9\s-]', '', 'g'   -- strip non-alphanumeric (keep spaces/hyphens)
      ),
      '[\s-]+', '-', 'g'             -- collapse spaces and hyphens to single hyphen
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprints    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------
--  profiles policies
-- ----------------------------------------------------------

-- Anyone can read any profile (needed for expert public pages).
CREATE POLICY "profiles: public read"
  ON public.profiles FOR SELECT
  USING (TRUE);

-- Users can only update their own profile.
CREATE POLICY "profiles: owner update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ----------------------------------------------------------
--  blueprints policies
-- ----------------------------------------------------------

-- Anyone can read published blueprints (marketplace / landing pages).
CREATE POLICY "blueprints: public read published"
  ON public.blueprints FOR SELECT
  USING (is_published = TRUE);

-- Creators can read all of their own blueprints (including drafts).
CREATE POLICY "blueprints: creator read own"
  ON public.blueprints FOR SELECT
  USING (auth.uid() = creator_id);

-- Creators can insert their own blueprints.
CREATE POLICY "blueprints: creator insert"
  ON public.blueprints FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own blueprints.
CREATE POLICY "blueprints: creator update"
  ON public.blueprints FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Creators can delete their own blueprints.
CREATE POLICY "blueprints: creator delete"
  ON public.blueprints FOR DELETE
  USING (auth.uid() = creator_id);


-- ----------------------------------------------------------
--  nodes policies
-- ----------------------------------------------------------

-- Anyone can read nodes that belong to a published blueprint.
CREATE POLICY "nodes: public read published"
  ON public.nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blueprints b
      WHERE b.id = nodes.blueprint_id
        AND b.is_published = TRUE
    )
  );

-- Creators can read all nodes of their own blueprints (including drafts).
CREATE POLICY "nodes: creator read own"
  ON public.nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blueprints b
      WHERE b.id = nodes.blueprint_id
        AND b.creator_id = auth.uid()
    )
  );

-- Creators can insert nodes into their own blueprints.
CREATE POLICY "nodes: creator insert"
  ON public.nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.blueprints b
      WHERE b.id = nodes.blueprint_id
        AND b.creator_id = auth.uid()
    )
  );

-- Creators can update nodes in their own blueprints.
CREATE POLICY "nodes: creator update"
  ON public.nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.blueprints b
      WHERE b.id = nodes.blueprint_id
        AND b.creator_id = auth.uid()
    )
  );

-- Creators can delete nodes in their own blueprints.
CREATE POLICY "nodes: creator delete"
  ON public.nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.blueprints b
      WHERE b.id = nodes.blueprint_id
        AND b.creator_id = auth.uid()
    )
  );


-- ----------------------------------------------------------
--  enrollments policies
-- ----------------------------------------------------------

-- Users can see their own enrollments.
CREATE POLICY "enrollments: user read own"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Creators can see enrollments for their own blueprints (analytics).
CREATE POLICY "enrollments: creator read own blueprint"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blueprints b
      WHERE b.id = enrollments.blueprint_id
        AND b.creator_id = auth.uid()
    )
  );

-- Users can enroll themselves (free blueprints / post-payment webhook).
-- For paid blueprints, enforce this via a server-side function or webhook
-- so the client can't self-enroll without payment.
CREATE POLICY "enrollments: user insert own"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------
--  user_progress policies
-- ----------------------------------------------------------

-- Users can read their own progress.
CREATE POLICY "progress: user read own"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress rows.
CREATE POLICY "progress: user insert own"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update (toggle) their own progress rows.
CREATE POLICY "progress: user update own"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete (un-complete) their own progress rows.
CREATE POLICY "progress: user delete own"
  ON public.user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Creators can read progress for nodes in their blueprints (analytics).
CREATE POLICY "progress: creator read own blueprint"
  ON public.user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.nodes n
      JOIN public.blueprints b ON b.id = n.blueprint_id
      WHERE n.id = user_progress.node_id
        AND b.creator_id = auth.uid()
    )
  );


-- ============================================================
--  SEED — optional example data
--  Delete or comment out before running in production.
-- ============================================================

/*

-- After creating an account, promote yourself to expert:
UPDATE public.profiles
SET role = 'expert'
WHERE id = '<your-user-uuid>';

-- Test the slugify function:
SELECT public.slugify('Full-Stack Development in 30 Days!');
-- → 'full-stack-development-in-30-days'

*/


-- ============================================================
--  DONE
--  Verify with:
--    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- ============================================================
