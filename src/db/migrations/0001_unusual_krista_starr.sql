ALTER TABLE "task" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "removed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users_to_tasks" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users_to_tasks" ADD COLUMN "removed_at" timestamp;