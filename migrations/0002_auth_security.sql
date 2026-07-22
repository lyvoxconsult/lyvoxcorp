CREATE TABLE "mfa_backup_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"factor_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "mfa_backup_codes_hash_check" CHECK (length(trim("mfa_backup_codes"."code_hash")) > 0),
	CONSTRAINT "mfa_backup_codes_used_at_check" CHECK ("mfa_backup_codes"."used_at" is null or "mfa_backup_codes"."used_at" >= "mfa_backup_codes"."created_at"),
	CONSTRAINT "mfa_backup_codes_version_check" CHECK ("mfa_backup_codes"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "mfa_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"challenge_hash" varchar(64) NOT NULL,
	"purpose" varchar(20) NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	CONSTRAINT "mfa_challenges_hash_length_check" CHECK (length("mfa_challenges"."challenge_hash") = 64),
	CONSTRAINT "mfa_challenges_purpose_check" CHECK ("mfa_challenges"."purpose" in ('ENROLLMENT', 'LOGIN', 'DISABLE')),
	CONSTRAINT "mfa_challenges_attempts_check" CHECK ("mfa_challenges"."attempts" between 0 and 5),
	CONSTRAINT "mfa_challenges_expiry_check" CHECK ("mfa_challenges"."expires_at" > "mfa_challenges"."created_at"),
	CONSTRAINT "mfa_challenges_consumed_at_check" CHECK ("mfa_challenges"."consumed_at" is null or "mfa_challenges"."consumed_at" >= "mfa_challenges"."created_at"),
	CONSTRAINT "mfa_challenges_version_check" CHECK ("mfa_challenges"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "mfa_factors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"user_id" uuid NOT NULL,
	"encrypted_secret" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"last_used_step" integer,
	CONSTRAINT "mfa_factors_encrypted_secret_check" CHECK (length(trim("mfa_factors"."encrypted_secret")) > 0),
	CONSTRAINT "mfa_factors_last_used_step_check" CHECK ("mfa_factors"."last_used_step" is null or "mfa_factors"."last_used_step" >= 0),
	CONSTRAINT "mfa_factors_version_check" CHECK ("mfa_factors"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "password_reset_tokens_token_hash_length_check" CHECK (length("password_reset_tokens"."token_hash") = 64),
	CONSTRAINT "password_reset_tokens_expiry_check" CHECK ("password_reset_tokens"."expires_at" > "password_reset_tokens"."created_at"),
	CONSTRAINT "password_reset_tokens_used_at_check" CHECK ("password_reset_tokens"."used_at" is null or "password_reset_tokens"."used_at" >= "password_reset_tokens"."created_at"),
	CONSTRAINT "password_reset_tokens_version_check" CHECK ("password_reset_tokens"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "password_credentials" ADD COLUMN "password_changed_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "csrf_token_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "last_seen_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "mfa_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "revocation_reason" varchar(100);--> statement-breakpoint
UPDATE "sessions"
SET "csrf_token_hash" = repeat('0', 64),
    "revoked_at" = coalesce("revoked_at", now()),
    "revocation_reason" = coalesce("revocation_reason", 'MIGRATION_CSRF_REQUIRED'),
    "updated_at" = now()
WHERE "csrf_token_hash" IS NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "csrf_token_hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_change_required" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "failed_login_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mfa_backup_codes" ADD CONSTRAINT "mfa_backup_codes_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_backup_codes" ADD CONSTRAINT "mfa_backup_codes_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_backup_codes" ADD CONSTRAINT "mfa_backup_codes_factor_id_mfa_factors_id_fk" FOREIGN KEY ("factor_id") REFERENCES "public"."mfa_factors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_challenges" ADD CONSTRAINT "mfa_challenges_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_challenges" ADD CONSTRAINT "mfa_challenges_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_challenges" ADD CONSTRAINT "mfa_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_challenges" ADD CONSTRAINT "mfa_challenges_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_factors" ADD CONSTRAINT "mfa_factors_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_factors" ADD CONSTRAINT "mfa_factors_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mfa_factors" ADD CONSTRAINT "mfa_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mfa_backup_codes_code_hash_uidx" ON "mfa_backup_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "mfa_backup_codes_factor_id_idx" ON "mfa_backup_codes" USING btree ("factor_id");--> statement-breakpoint
CREATE INDEX "mfa_backup_codes_unused_idx" ON "mfa_backup_codes" USING btree ("factor_id") WHERE "mfa_backup_codes"."used_at" is null and "mfa_backup_codes"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "mfa_challenges_challenge_hash_uidx" ON "mfa_challenges" USING btree ("challenge_hash");--> statement-breakpoint
CREATE INDEX "mfa_challenges_user_id_idx" ON "mfa_challenges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mfa_challenges_session_id_idx" ON "mfa_challenges" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "mfa_challenges_expires_at_idx" ON "mfa_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "mfa_challenges_active_idx" ON "mfa_challenges" USING btree ("user_id","expires_at") WHERE "mfa_challenges"."consumed_at" is null and "mfa_challenges"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "mfa_factors_user_active_uidx" ON "mfa_factors" USING btree ("user_id") WHERE "mfa_factors"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "mfa_factors_enabled_idx" ON "mfa_factors" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "mfa_factors_deleted_at_idx" ON "mfa_factors" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_uidx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_active_idx" ON "password_reset_tokens" USING btree ("user_id","expires_at") WHERE "password_reset_tokens"."used_at" is null and "password_reset_tokens"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "sessions_user_last_seen_at_idx" ON "sessions" USING btree ("user_id","last_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_uidx" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "users_locked_until_idx" ON "users" USING btree ("locked_until");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_csrf_token_hash_length_check" CHECK (length("sessions"."csrf_token_hash") = 64);--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_revocation_reason_check" CHECK ("sessions"."revocation_reason" is null or length(trim("sessions"."revocation_reason")) > 0);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_failed_login_attempts_check" CHECK ("users"."failed_login_attempts" >= 0);
