import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// This matches Supabase's internal Auth table structure
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // This will link to Supabase Auth
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});