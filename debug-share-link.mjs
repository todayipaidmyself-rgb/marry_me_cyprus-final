import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { shareLinks } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log("=== DEBUG: Share Link Test ===\n");

// Get all shareLinks
const all = await db.select().from(shareLinks);
console.log("All shareLinks:", JSON.stringify(all, null, 2));

if (all.length > 0) {
  const firstLink = all[0];
  console.log("\nFirst link shareToken:", firstLink.shareToken);
  console.log("Token length:", firstLink.shareToken.length);
  console.log(
    "Token bytes:",
    Buffer.from(firstLink.shareToken).toString("hex")
  );

  // Try to query it back
  console.log("\nQuerying with eq(shareLinks.shareToken, token)...");
  const results = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.shareToken, firstLink.shareToken));
  console.log("Query results:", JSON.stringify(results, null, 2));
}

await connection.end();
