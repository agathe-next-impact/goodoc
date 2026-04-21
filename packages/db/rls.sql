-- ═══════════════════════════════════════════════════════════════════
-- MedSite — Row-Level Security policies
-- ───────────────────────────────────────────────────────────────────
-- Strategy: every tenant-scoped table is guarded by a single
-- `tenant_isolation` policy that compares `tenant_id` against the
-- session-local setting `app.current_tenant_id`.
--
-- The application is expected to SET LOCAL app.current_tenant_id = '<uuid>'
-- at the start of every transaction, via the Drizzle client.
--
-- Table owners bypass RLS by default, so migrations and seeds (which
-- run as the DB owner) still work. Runtime app connections should use
-- a non-owner role that inherits NOTHING beyond SELECT/INSERT/UPDATE/DELETE.
-- ═══════════════════════════════════════════════════════════════════

-- ── practitioners ──────────────────────────────────────────────────
ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON practitioners;
CREATE POLICY tenant_isolation ON practitioners
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── addresses ──────────────────────────────────────────────────────
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON addresses;
CREATE POLICY tenant_isolation ON addresses
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── opening_hours ──────────────────────────────────────────────────
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON opening_hours;
CREATE POLICY tenant_isolation ON opening_hours
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── services ───────────────────────────────────────────────────────
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON services;
CREATE POLICY tenant_isolation ON services
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── pages ──────────────────────────────────────────────────────────
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON pages;
CREATE POLICY tenant_isolation ON pages
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── blog_posts ─────────────────────────────────────────────────────
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON blog_posts;
CREATE POLICY tenant_isolation ON blog_posts
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── faq_items ──────────────────────────────────────────────────────
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON faq_items;
CREATE POLICY tenant_isolation ON faq_items
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── testimonials ───────────────────────────────────────────────────
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON testimonials;
CREATE POLICY tenant_isolation ON testimonials
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── contact_messages ───────────────────────────────────────────────
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON contact_messages;
CREATE POLICY tenant_isolation ON contact_messages
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── site_settings ──────────────────────────────────────────────────
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON site_settings;
CREATE POLICY tenant_isolation ON site_settings
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- ── media ──────────────────────────────────────────────────────────
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON media;
CREATE POLICY tenant_isolation ON media
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);

-- Note: `tenants` and `plans` are system-level tables and are NOT
-- guarded by RLS. Access to these is controlled by GRANT at the role level.
