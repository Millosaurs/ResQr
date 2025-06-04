CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"phone" varchar(20),
	"email" varchar(255),
	"google_business_url" text,
	"google_rating" varchar(3),
	"cuisine_type" varchar(100),
	"description" text,
	"logo_url" text,
	"color_theme" varchar(7) DEFAULT '#000000',
	"is_active" boolean DEFAULT true,
	"subscription_tier" varchar(20) DEFAULT 'FREE',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;