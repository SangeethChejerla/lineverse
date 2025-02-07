CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(255) NOT NULL,
	"icon" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phrases" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"category_id" integer NOT NULL,
	"pinned" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "phrases" ADD CONSTRAINT "phrases_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_label_unique" ON "categories" USING btree ("label");