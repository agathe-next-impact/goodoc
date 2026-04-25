-- Polymorphic FK columns for Payload's `_rels` join tables.
-- One nullable `<collection>_id` column per collection declared in payload.config.ts,
-- each with ON DELETE CASCADE + an index (what Payload would create with push:true).
-- Slugs are snake-cased (e.g. `blog-posts` -> `blog_posts_id`).

-- ── payload_locked_documents_rels ─────────────────────────────
ALTER TABLE "payload_locked_documents_rels"
  ADD COLUMN IF NOT EXISTS "practitioners_id"    uuid,
  ADD COLUMN IF NOT EXISTS "services_id"         uuid,
  ADD COLUMN IF NOT EXISTS "pages_id"            uuid,
  ADD COLUMN IF NOT EXISTS "blog_posts_id"       uuid,
  ADD COLUMN IF NOT EXISTS "faq_items_id"        uuid,
  ADD COLUMN IF NOT EXISTS "testimonials_id"     uuid,
  ADD COLUMN IF NOT EXISTS "contact_messages_id" uuid,
  ADD COLUMN IF NOT EXISTS "addresses_id"        uuid,
  ADD COLUMN IF NOT EXISTS "opening_hours_id"    uuid,
  ADD COLUMN IF NOT EXISTS "media_id"            uuid;

DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "pld_rels_practitioners_fk"    FOREIGN KEY ("practitioners_id")    REFERENCES "practitioners"("id")    ON DELETE cascade,
    ADD CONSTRAINT "pld_rels_services_fk"         FOREIGN KEY ("services_id")         REFERENCES "services"("id")         ON DELETE cascade,
    ADD CONSTRAINT "pld_rels_pages_fk"            FOREIGN KEY ("pages_id")            REFERENCES "pages"("id")            ON DELETE cascade,
    ADD CONSTRAINT "pld_rels_blog_posts_fk"       FOREIGN KEY ("blog_posts_id")       REFERENCES "blog_posts"("id")       ON DELETE cascade,
    ADD CONSTRAINT "pld_rels_faq_items_fk"        FOREIGN KEY ("faq_items_id")        REFERENCES "faq_items"("id")        ON DELETE cascade,
    ADD CONSTRAINT "pld_rels_testimonials_fk"     FOREIGN KEY ("testimonials_id")     REFERENCES "testimonials"("id")     ON DELETE cascade,
    ADD CONSTRAINT "pld_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "contact_messages"("id") ON DELETE cascade,
    ADD CONSTRAINT "pld_rels_addresses_fk"        FOREIGN KEY ("addresses_id")        REFERENCES "addresses"("id")        ON DELETE cascade,
    ADD CONSTRAINT "pld_rels_opening_hours_fk"    FOREIGN KEY ("opening_hours_id")    REFERENCES "opening_hours"("id")    ON DELETE cascade,
    ADD CONSTRAINT "pld_rels_media_fk"            FOREIGN KEY ("media_id")            REFERENCES "media"("id")            ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "pld_rels_practitioners_idx"    ON "payload_locked_documents_rels" ("practitioners_id");
CREATE INDEX IF NOT EXISTS "pld_rels_services_idx"         ON "payload_locked_documents_rels" ("services_id");
CREATE INDEX IF NOT EXISTS "pld_rels_pages_idx"            ON "payload_locked_documents_rels" ("pages_id");
CREATE INDEX IF NOT EXISTS "pld_rels_blog_posts_idx"       ON "payload_locked_documents_rels" ("blog_posts_id");
CREATE INDEX IF NOT EXISTS "pld_rels_faq_items_idx"        ON "payload_locked_documents_rels" ("faq_items_id");
CREATE INDEX IF NOT EXISTS "pld_rels_testimonials_idx"     ON "payload_locked_documents_rels" ("testimonials_id");
CREATE INDEX IF NOT EXISTS "pld_rels_contact_messages_idx" ON "payload_locked_documents_rels" ("contact_messages_id");
CREATE INDEX IF NOT EXISTS "pld_rels_addresses_idx"        ON "payload_locked_documents_rels" ("addresses_id");
CREATE INDEX IF NOT EXISTS "pld_rels_opening_hours_idx"    ON "payload_locked_documents_rels" ("opening_hours_id");
CREATE INDEX IF NOT EXISTS "pld_rels_media_idx"            ON "payload_locked_documents_rels" ("media_id");

-- ── payload_preferences_rels ──────────────────────────────────
ALTER TABLE "payload_preferences_rels"
  ADD COLUMN IF NOT EXISTS "practitioners_id"    uuid,
  ADD COLUMN IF NOT EXISTS "services_id"         uuid,
  ADD COLUMN IF NOT EXISTS "pages_id"            uuid,
  ADD COLUMN IF NOT EXISTS "blog_posts_id"       uuid,
  ADD COLUMN IF NOT EXISTS "faq_items_id"        uuid,
  ADD COLUMN IF NOT EXISTS "testimonials_id"     uuid,
  ADD COLUMN IF NOT EXISTS "contact_messages_id" uuid,
  ADD COLUMN IF NOT EXISTS "addresses_id"        uuid,
  ADD COLUMN IF NOT EXISTS "opening_hours_id"    uuid,
  ADD COLUMN IF NOT EXISTS "media_id"            uuid;

DO $$ BEGIN
  ALTER TABLE "payload_preferences_rels"
    ADD CONSTRAINT "pp_rels_practitioners_fk"    FOREIGN KEY ("practitioners_id")    REFERENCES "practitioners"("id")    ON DELETE cascade,
    ADD CONSTRAINT "pp_rels_services_fk"         FOREIGN KEY ("services_id")         REFERENCES "services"("id")         ON DELETE cascade,
    ADD CONSTRAINT "pp_rels_pages_fk"            FOREIGN KEY ("pages_id")            REFERENCES "pages"("id")            ON DELETE cascade,
    ADD CONSTRAINT "pp_rels_blog_posts_fk"       FOREIGN KEY ("blog_posts_id")       REFERENCES "blog_posts"("id")       ON DELETE cascade,
    ADD CONSTRAINT "pp_rels_faq_items_fk"        FOREIGN KEY ("faq_items_id")        REFERENCES "faq_items"("id")        ON DELETE cascade,
    ADD CONSTRAINT "pp_rels_testimonials_fk"     FOREIGN KEY ("testimonials_id")     REFERENCES "testimonials"("id")     ON DELETE cascade,
    ADD CONSTRAINT "pp_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "contact_messages"("id") ON DELETE cascade,
    ADD CONSTRAINT "pp_rels_addresses_fk"        FOREIGN KEY ("addresses_id")        REFERENCES "addresses"("id")        ON DELETE cascade,
    ADD CONSTRAINT "pp_rels_opening_hours_fk"    FOREIGN KEY ("opening_hours_id")    REFERENCES "opening_hours"("id")    ON DELETE cascade,
    ADD CONSTRAINT "pp_rels_media_fk"            FOREIGN KEY ("media_id")            REFERENCES "media"("id")            ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "pp_rels_practitioners_idx"    ON "payload_preferences_rels" ("practitioners_id");
CREATE INDEX IF NOT EXISTS "pp_rels_services_idx"         ON "payload_preferences_rels" ("services_id");
CREATE INDEX IF NOT EXISTS "pp_rels_pages_idx"            ON "payload_preferences_rels" ("pages_id");
CREATE INDEX IF NOT EXISTS "pp_rels_blog_posts_idx"       ON "payload_preferences_rels" ("blog_posts_id");
CREATE INDEX IF NOT EXISTS "pp_rels_faq_items_idx"        ON "payload_preferences_rels" ("faq_items_id");
CREATE INDEX IF NOT EXISTS "pp_rels_testimonials_idx"     ON "payload_preferences_rels" ("testimonials_id");
CREATE INDEX IF NOT EXISTS "pp_rels_contact_messages_idx" ON "payload_preferences_rels" ("contact_messages_id");
CREATE INDEX IF NOT EXISTS "pp_rels_addresses_idx"        ON "payload_preferences_rels" ("addresses_id");
CREATE INDEX IF NOT EXISTS "pp_rels_opening_hours_idx"    ON "payload_preferences_rels" ("opening_hours_id");
CREATE INDEX IF NOT EXISTS "pp_rels_media_idx"            ON "payload_preferences_rels" ("media_id");
