import { integer, pgTable, serial, text, timestamp, numeric, uuid} from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: uuid("id").primaryKey(), 
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

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});