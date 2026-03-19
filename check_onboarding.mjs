import { db } from "./server/db.js";
import { getUserProfile } from "./server/db.js";

// Get profile for user ID 1 (Emma)
const profile = await getUserProfile({ userId: "1" });
console.log("Profile data:");
console.log(JSON.stringify(profile, null, 2));

if (profile?.onboardingData) {
  console.log("\nOnboarding data:");
  const data =
    typeof profile.onboardingData === "string"
      ? JSON.parse(profile.onboardingData)
      : profile.onboardingData;
  console.log(JSON.stringify(data, null, 2));
}

process.exit(0);
