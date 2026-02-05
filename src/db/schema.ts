import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// This matches Supabase's internal Auth table structure
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // This will link to Supabase Auth
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});


export const plaidItems = pgTable("plaid_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  

  userId: uuid("user_id").notNull(), 
  
  accessToken: text("access_token").notNull(),
  itemId: text("item_id").notNull(),
  institutionName: text("institution_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});