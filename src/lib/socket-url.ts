/** URL Socket.IO сервера (локально http, на Render https) */
export function getSocketUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (!raw) return "http://localhost:3001";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}
