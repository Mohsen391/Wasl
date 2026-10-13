import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const ordersTable = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderReference: text("order_reference").notNull(),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    governorate: text("governorate").notNull(),
    area: text("area").notNull(),
    block: text("block").notNull(),
    street: text("street").notNull(),
    building: text("building").notNull(),
    instructions: text("instructions"),
    currency: text("currency").notNull().default("KWD"),
    subtotalFils: integer("subtotal_fils").notNull(),
    discountFils: integer("discount_fils").notNull().default(0),
    totalFils: integer("total_fils").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("orders_order_reference_unique").on(table.orderReference)],
);

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
