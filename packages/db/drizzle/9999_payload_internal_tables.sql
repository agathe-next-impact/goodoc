-- Payload CMS internal tables.
-- Not managed by Drizzle schema (we keep `push: false` on Payload so it
-- doesn't try to own our app tables). These are required at runtime for:
--   payload_preferences       → admin UI user prefs (column widths, etc.)
--   payload_locked_documents  → edit locks on documents
--   payload_migrations        → Payload's own migration tracking
-- Structure mirrors what @payloadcms/db-postgres would create with push:true.

CREATE TABLE IF NOT EXISTS "payload_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" varchar,
  "value" jsonb,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" uuid NOT NULL,
  "path" varchar NOT NULL,
  "users_id" uuid,
  CONSTRAINT "payload_preferences_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "payload_preferences"("id") ON DELETE cascade,
  CONSTRAINT "payload_preferences_rels_users_fk"
    FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx"
  ON "payload_preferences" ("key");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx"
  ON "payload_preferences_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx"
  ON "payload_preferences_rels" ("path");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_idx"
  ON "payload_preferences_rels" ("users_id");

CREATE TABLE IF NOT EXISTS "payload_migrations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar,
  "batch" numeric,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "global_slug" varchar,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  "id" serial PRIMARY KEY NOT NULL,
  "order" integer,
  "parent_id" uuid NOT NULL,
  "path" varchar NOT NULL,
  "users_id" uuid,
  CONSTRAINT "payload_locked_documents_rels_parent_fk"
    FOREIGN KEY ("parent_id") REFERENCES "payload_locked_documents"("id") ON DELETE cascade,
  CONSTRAINT "payload_locked_documents_rels_users_fk"
    FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx"
  ON "payload_locked_documents" ("global_slug");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx"
  ON "payload_locked_documents_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx"
  ON "payload_locked_documents_rels" ("path");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_idx"
  ON "payload_locked_documents_rels" ("users_id");
