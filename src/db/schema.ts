import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/** Single-row key/value store for site-wide settings (key = "site"). */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * A landing page. One domain can serve many: "/" shows the home page and every
 * other page lives at "/<slug>". `template` picks the layout code (src/templates),
 * `settings` holds this page's design + SEO + pixel overrides on top of the site-wide row.
 */
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  template: text("template").notNull().default("classic"),
  isHome: boolean("is_home").notNull().default(false),
  published: boolean("published").notNull().default(true),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Landing page sections. `type` decides the renderer, `data` holds its content. */
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id"),
  type: text("type").notNull(),
  position: integer("position").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Sellable offers shown in the order form (e.g. "1 combo set", "2 combo sets"). */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id"),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  price: integer("price").notNull(),
  comparePrice: integer("compare_price"),
  image: text("image").notNull().default(""),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OrderItem = { productId: number; name: string; price: number; qty: number };

import { ORDER_STATUSES, type OrderStatus } from "../lib/statuses";
export { ORDER_STATUSES, type OrderStatus };

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNo: text("order_no").notNull().unique(),
    pageId: integer("page_id"),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    area: text("area").notNull().default("inside"),
    items: jsonb("items").$type<OrderItem[]>().notNull(),
    subtotal: integer("subtotal").notNull(),
    deliveryCharge: integer("delivery_charge").notNull().default(0),
    total: integer("total").notNull(),
    status: text("status").$type<OrderStatus>().notNull().default("pending"),
    customerNote: text("customer_note").notNull().default(""),
    adminNote: text("admin_note").notNull().default(""),
    ip: text("ip").notNull().default(""),
    userAgent: text("user_agent").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("orders_phone_idx").on(t.phone), index("orders_created_idx").on(t.createdAt)],
);

export type Page = typeof pages.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
