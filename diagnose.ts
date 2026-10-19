import { redis } from "./src/config/redis";
import { getSpotifyAccessToken } from "./src/services/spotify-token.service";

async function diagnose() {
  await redis.connect();
  const token = await getSpotifyAccessToken(3);

  // Check user's Spotify account details
  console.log("=== Checking user's Spotify account ===\n");

  const meRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const me: any = await meRes.json();
  console.log("User:", me.display_name);
  console.log("Spotify ID:", me.id);
  console.log("Product (subscription):", me.product);
  console.log("Country:", me.country);

  // Check what scopes the token actually has
  // Spotify doesn't expose scopes directly, but we can infer from behavior
  console.log("\n=== Scope tests ===\n");

  const tests = [
    { name: "playlist-read-private (via /v1/me/playlists)", url: "https://api.spotify.com/v1/me/playlists?limit=1" },
    { name: "user-read-private (via /v1/me)", url: "https://api.spotify.com/v1/me" },
    { name: "/v1/users/{id}/playlists (the failing one)", url: `https://api.spotify.com/v1/users/${me.id}/playlists?limit=1` },
  ];

  for (const test of tests) {
    const res = await fetch(test.url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`${res.status === 200 ? "✓" : "✗"} ${test.name} → ${res.status}`);
    if (res.status !== 200) {
      const body = await res.json();
      console.log(`  Error: ${JSON.stringify(body)}`);
    }
  }

  await redis.quit();
  process.exit(0);
}

diagnose();
