CREATE TYPE "public"."inventory_movement_type" AS ENUM('opening', 'adjustment', 'sale');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'packed', 'shipped', 'collected', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."part_condition" AS ENUM('new', 'compatible', 'refurbished', 'used');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('sent', 'accepted', 'rejected', 'withdrawn', 'expired');--> statement-breakpoint
CREATE TYPE "public"."repair_method" AS ENUM('on_site', 'pickup_dropoff', 'shop_visit');--> statement-breakpoint
CREATE TYPE "public"."repair_status" AS ENUM('requested', 'quoted', 'booked', 'in_progress', 'waiting_for_parts', 'completed', 'cancelled', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('published', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('consumer', 'technician', 'seller', 'admin');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('draft', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "consumer_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"contact_preference" varchar(20) DEFAULT 'phone' NOT NULL,
	"default_location_text" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"order_id" uuid,
	"changed_by_id" uuid,
	"type" "inventory_movement_type" NOT NULL,
	"quantity_delta" integer NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part_listing_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"object_key" varchar(512) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "part_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"compatible_devices" text NOT NULL,
	"condition" "part_condition" NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'LKR' NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"warranty_days" integer,
	"delivery_options" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "part_listings_stock_nonnegative" CHECK ("part_listings"."stock_quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "part_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"fulfilment_address" varchar(500) NOT NULL,
	"contact_phone" varchar(32) NOT NULL,
	"buyer_note" text,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "part_orders_quantity_positive" CHECK ("part_orders"."quantity" > 0),
	CONSTRAINT "part_orders_buyer_not_seller" CHECK ("part_orders"."buyer_id" <> "part_orders"."seller_id")
);
--> statement-breakpoint
CREATE TABLE "platform_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"phone" varchar(32),
	"primary_role" "user_role" DEFAULT 'consumer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "repair_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_request_id" uuid NOT NULL,
	"accepted_quote_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repair_bookings_repair_request_id_unique" UNIQUE("repair_request_id"),
	CONSTRAINT "repair_bookings_accepted_quote_id_unique" UNIQUE("accepted_quote_id")
);
--> statement-breakpoint
CREATE TABLE "repair_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_request_id" uuid NOT NULL,
	"technician_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'LKR' NOT NULL,
	"message" text,
	"estimated_duration_hours" integer,
	"expires_at" timestamp with time zone,
	"status" "quote_status" DEFAULT 'sent' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_request_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_request_id" uuid NOT NULL,
	"object_key" varchar(512) NOT NULL,
	"media_type" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consumer_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"device_brand" varchar(120),
	"device_model" varchar(160),
	"issue_description" text NOT NULL,
	"preferred_method" "repair_method" NOT NULL,
	"location_text" varchar(255) NOT NULL,
	"preferred_at" timestamp with time zone,
	"budget_amount" numeric(12, 2),
	"currency" varchar(3) DEFAULT 'LKR' NOT NULL,
	"status" "repair_status" DEFAULT 'requested' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repair_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_request_id" uuid NOT NULL,
	"changed_by_id" uuid NOT NULL,
	"previous_status" "repair_status",
	"next_status" "repair_status" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repair_request_id" uuid,
	"part_order_id" uuid,
	"author_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"body" text,
	"status" "review_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_range" CHECK ("reviews"."rating" between 1 and 5),
	CONSTRAINT "reviews_exactly_one_context" CHECK (("reviews"."repair_request_id" is not null) <> ("reviews"."part_order_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "seller_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"store_name" varchar(160) NOT NULL,
	"description" text,
	"service_area" varchar(255),
	"verification_status" "verification_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technician_categories" (
	"technician_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technician_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"business_name" varchar(160) NOT NULL,
	"bio" text,
	"service_area" varchar(255) NOT NULL,
	"years_experience" integer DEFAULT 0 NOT NULL,
	"offers_mobile_service" boolean DEFAULT false NOT NULL,
	"verification_status" "verification_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "consumer_profiles" ADD CONSTRAINT "consumer_profiles_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_listing_id_part_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."part_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_order_id_part_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."part_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_changed_by_id_platform_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."platform_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_listing_images" ADD CONSTRAINT "part_listing_images_listing_id_part_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."part_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_listings" ADD CONSTRAINT "part_listings_seller_id_seller_profiles_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_listings" ADD CONSTRAINT "part_listings_category_id_device_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."device_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_orders" ADD CONSTRAINT "part_orders_listing_id_part_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."part_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_orders" ADD CONSTRAINT "part_orders_seller_id_seller_profiles_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_orders" ADD CONSTRAINT "part_orders_buyer_id_platform_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."platform_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_bookings" ADD CONSTRAINT "repair_bookings_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_bookings" ADD CONSTRAINT "repair_bookings_accepted_quote_id_repair_quotes_id_fk" FOREIGN KEY ("accepted_quote_id") REFERENCES "public"."repair_quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_quotes" ADD CONSTRAINT "repair_quotes_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_quotes" ADD CONSTRAINT "repair_quotes_technician_id_technician_profiles_user_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technician_profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_request_media" ADD CONSTRAINT "repair_request_media_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD CONSTRAINT "repair_requests_consumer_id_platform_users_id_fk" FOREIGN KEY ("consumer_id") REFERENCES "public"."platform_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_requests" ADD CONSTRAINT "repair_requests_category_id_device_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."device_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_status_history" ADD CONSTRAINT "repair_status_history_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_status_history" ADD CONSTRAINT "repair_status_history_changed_by_id_platform_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."platform_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "public"."repair_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_part_order_id_part_orders_id_fk" FOREIGN KEY ("part_order_id") REFERENCES "public"."part_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_platform_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."platform_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_subject_id_platform_users_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."platform_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_profiles" ADD CONSTRAINT "seller_profiles_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_categories" ADD CONSTRAINT "technician_categories_technician_id_technician_profiles_user_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technician_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_categories" ADD CONSTRAINT "technician_categories_category_id_device_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."device_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technician_profiles" ADD CONSTRAINT "technician_profiles_user_id_platform_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."platform_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "device_categories_slug_unique" ON "device_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "inventory_movements_listing_created_idx" ON "inventory_movements" USING btree ("listing_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "part_listing_images_object_key_unique" ON "part_listing_images" USING btree ("object_key");--> statement-breakpoint
CREATE UNIQUE INDEX "part_listing_images_position_unique" ON "part_listing_images" USING btree ("listing_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "part_listings_seller_sku_unique" ON "part_listings" USING btree ("seller_id","sku");--> statement-breakpoint
CREATE INDEX "part_listings_discovery_idx" ON "part_listings" USING btree ("is_active","category_id");--> statement-breakpoint
CREATE INDEX "part_orders_buyer_created_idx" ON "part_orders" USING btree ("buyer_id","created_at");--> statement-breakpoint
CREATE INDEX "part_orders_seller_status_idx" ON "part_orders" USING btree ("seller_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "repair_quotes_one_per_technician_unique" ON "repair_quotes" USING btree ("repair_request_id","technician_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repair_quotes_one_accepted_per_request_unique" ON "repair_quotes" USING btree ("repair_request_id") WHERE "repair_quotes"."status" = 'accepted';--> statement-breakpoint
CREATE INDEX "repair_quotes_request_status_idx" ON "repair_quotes" USING btree ("repair_request_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "repair_request_media_object_key_unique" ON "repair_request_media" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "repair_requests_consumer_created_idx" ON "repair_requests" USING btree ("consumer_id","created_at");--> statement-breakpoint
CREATE INDEX "repair_requests_leads_idx" ON "repair_requests" USING btree ("status","category_id");--> statement-breakpoint
CREATE INDEX "repair_status_history_request_created_idx" ON "repair_status_history" USING btree ("repair_request_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_one_per_repair_author_unique" ON "reviews" USING btree ("repair_request_id","author_id") WHERE "reviews"."repair_request_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_one_per_order_author_unique" ON "reviews" USING btree ("part_order_id","author_id") WHERE "reviews"."part_order_id" is not null;--> statement-breakpoint
CREATE INDEX "seller_profiles_discovery_idx" ON "seller_profiles" USING btree ("verification_status","service_area");--> statement-breakpoint
CREATE UNIQUE INDEX "technician_categories_unique" ON "technician_categories" USING btree ("technician_id","category_id");--> statement-breakpoint
CREATE INDEX "technician_categories_category_idx" ON "technician_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "technician_profiles_discovery_idx" ON "technician_profiles" USING btree ("verification_status","service_area");