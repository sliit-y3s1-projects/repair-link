ALTER TABLE "technician_profiles" ADD COLUMN "skills" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "technician_profiles" ADD COLUMN "services" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "technician_profiles" ADD COLUMN "availability" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "technician_profiles" ADD COLUMN "portfolio" jsonb DEFAULT '[]'::jsonb NOT NULL;