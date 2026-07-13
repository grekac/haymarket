const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://haymarket-jct5.onrender.com";

export function getSiteUrl(path = "") {
  return `${BASE}${path}`;
}
