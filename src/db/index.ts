import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __pg: ReturnType<typeof postgres> | undefined;
}

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // prepare:false keeps it compatible with Neon / PgBouncer pooled connections.
  return postgres(url, { prepare: false, max: 5 });
}

const sql = globalThis.__pg ?? client();
if (process.env.NODE_ENV !== "production") globalThis.__pg = sql;

export const db = drizzle(sql, { schema });
export { schema };
