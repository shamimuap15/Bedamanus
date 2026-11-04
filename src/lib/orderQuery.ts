import "server-only";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";
import { schema } from "@/db";
import { ORDER_STATUSES, type OrderStatus } from "@/db/schema";

export function orderFilters(status?: string, q?: string) {
  const where: SQL[] = [];
  if (status && ORDER_STATUSES.includes(status as OrderStatus)) where.push(eq(schema.orders.status, status as OrderStatus));
  const term = (q ?? "").trim();
  if (term) {
    const like = `%${term}%`;
    where.push(or(ilike(schema.orders.orderNo, like), ilike(schema.orders.phone, like), ilike(schema.orders.name, like), ilike(schema.orders.address, like))!);
  }
  return where.length ? and(...where) : undefined;
}
