CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'practitioner', 'collaborator');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"role" "enum_users_role" DEFAULT 'practitioner' NOT NULL,
	"tenant_id" uuid,
	"email" varchar(255) NOT NULL,
	"hash" varchar(255),
	"salt" varchar(255),
	"reset_password_token" varchar(255),
	"reset_password_expiration" timestamp with time zone,
	"login_attempts" integer DEFAULT 0 NOT NULL,
	"lock_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_tenant_idx" ON "users" USING btree ("tenant_id");