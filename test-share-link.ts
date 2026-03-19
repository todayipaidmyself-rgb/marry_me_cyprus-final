import {
  createShareLink,
  getSharedProfile,
  generateShareToken,
} from "./server/db";

async function testShareLink() {
  console.log("=== Testing Share Link Functionality ===\n");

  // Test 1: Generate a token
  const token = generateShareToken();
  console.log("1. Generated token:", token);
  console.log("   Token length:", token.length);

  // Test 2: Create a share link
  console.log("\n2. Creating share link for userId: 2");
  try {
    const shareLink = await createShareLink({
      userId: 2,
      shareToken: token,
    });
    console.log("   Created share link:", shareLink);
  } catch (error) {
    console.error("   Error creating share link:", error);
  }

  // Test 3: Retrieve the share link
  console.log("\n3. Retrieving share link with token:", token);
  try {
    const profile = await getSharedProfile(token);
    console.log("   Retrieved profile:", profile ? "found" : "not found");
    if (profile) {
      console.log("   Profile data:", JSON.stringify(profile, null, 2));
    }
  } catch (error) {
    console.error("   Error retrieving profile:", error);
  }

  process.exit(0);
}

testShareLink();
