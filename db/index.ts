import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import * as schema from "./schema";
import * as relations from "./relations"; // <-- import your relations

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

// ✅ Merge schema and relations
export const db = drizzle(sql, {
  schema: {
    ...schema,
    ...relations,
  },
});
