CREATE TABLE "service_price_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"service_id" uuid NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now() NOT NULL,
	"effective_to" timestamp with time zone,
	CONSTRAINT "spv_price_check" CHECK ("service_price_versions"."price" >= 0),
	CONSTRAINT "spv_dates_check" CHECK ("service_price_versions"."effective_to" is null or "service_price_versions"."effective_to" >= "service_price_versions"."effective_from"),
	CONSTRAINT "spv_version_check" CHECK ("service_price_versions"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"billing_type" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"base_price" numeric(15, 2) NOT NULL,
	CONSTRAINT "services_price_check" CHECK ("services"."base_price" >= 0),
	CONSTRAINT "services_version_check" CHECK ("services"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "service_price_versions" ADD CONSTRAINT "service_price_versions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_versions" ADD CONSTRAINT "service_price_versions_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_price_versions" ADD CONSTRAINT "service_price_versions_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spv_service_id_idx" ON "service_price_versions" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "spv_effective_dates_idx" ON "service_price_versions" USING btree ("effective_from","effective_to");--> statement-breakpoint
CREATE INDEX "services_category_idx" ON "services" USING btree ("category");--> statement-breakpoint
CREATE INDEX "services_deleted_at_idx" ON "services" USING btree ("deleted_at");