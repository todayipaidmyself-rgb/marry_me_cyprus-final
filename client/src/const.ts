export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = (): string => {
  const baseUrl = import.meta.env.VITE_OAUTH_SERVER_URL?.trim();
  const appId = import.meta.env.VITE_APP_ID?.trim();
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  if (!baseUrl) {
    console.warn("OAUTH_SERVER_URL not configured – login link disabled");
    return "#";
  }

  try {
    const url = new URL("/app-auth", baseUrl);
    if (!appId) {
      console.warn("VITE_APP_ID not configured – login link may not work");
    } else {
      url.searchParams.set("appId", appId);
    }
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (err) {
    console.error("Invalid OAUTH_SERVER_URL:", baseUrl, err);
    return "#";
  }
};
