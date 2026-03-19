import { getDb } from "./server/db";
import { users, userProfiles } from "./drizzle/schema";

async function checkUsers() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  console.log("=== All Users ===");
  const allUsers = await db.select().from(users);
  allUsers.forEach(user => {
    console.log(
      `User ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`
    );
  });

  console.log("\n=== All User Profiles ===");
  const allProfiles = await db.select().from(userProfiles);
  allProfiles.forEach(profile => {
    console.log(
      `UserID: ${profile.userId}, Name: ${profile.firstName}, Email: ${profile.email}`
    );
  });

  process.exit(0);
}

checkUsers();
