import { createServer } from "http";
import { Server } from "socket.io";
import { verifyInternalSecret, verifySocketToken } from "./auth";

const PORT = Number(process.env.PORT || process.env.SOCKET_PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

function normalizeOrigin(origin: string): string {
  const trimmed = origin.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.includes("localhost") || trimmed.startsWith("127.0.0.1")) return `http://${trimmed}`;
  return `https://${trimmed}`;
}

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ??
  [process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"].filter(Boolean).join(",")
)
  .split(",")
  .map((o) => normalizeOrigin(o))
  .filter(Boolean);

const httpServer = createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "text/plain" }).end("ok");
    return;
  }
  if (req.method === "POST" && req.url === "/emit") {
    const secret = req.headers["x-socket-secret"] as string | undefined;
    if (!verifyInternalSecret(secret)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    let body = "";
    for await (const chunk of req) body += chunk;
    try {
      const { conversationId, message } = JSON.parse(body);
      io.to(`conv:${conversationId}`).emit("message", message);
      res.writeHead(200).end("ok");
    } catch {
      res.writeHead(400).end("error");
    }
    return;
  }
  res.writeHead(404).end();
});

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", async (data: { conversationId: string; token: string }) => {
    try {
      if (!data?.conversationId || !data?.token) throw new Error("missing");
      await verifySocketToken(data.token);
      socket.join(`conv:${data.conversationId}`);
    } catch {
      socket.emit("error", "unauthorized");
    }
  });

  socket.on("leave", (conversationId: string) => {
    socket.leave(`conv:${conversationId}`);
  });

  socket.on("typing", (data: { conversationId: string; userId: string }) => {
    socket.to(`conv:${data.conversationId}`).emit("typing", data);
  });

  socket.on("stop_typing", (data: { conversationId: string; userId: string }) => {
    socket.to(`conv:${data.conversationId}`).emit("stop_typing", data);
  });

  socket.on("disconnect", () => {});
});

httpServer.listen(PORT, HOST, () => {
  console.log(`[socket] HayMarket chat server on ${HOST}:${PORT}`);
});
