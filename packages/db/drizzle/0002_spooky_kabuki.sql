ALTER TABLE "users" ALTER COLUMN "hash" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "salt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "reset_password_token" SET DATA TYPE text;