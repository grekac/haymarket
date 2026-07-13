import { createServer } from "http";
import { Server } from "socket.io";
import { verifyInternalSecret, verifySocketToken } from "./auth";

const PORT = Number(process.env.PORT || process.env.SOCKET_PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
  "https://haymarket-jct5.onrender.com",
].filter(Boolean) as string[];

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

  socket.on("disconnect", () => {});
});

httpServer.listen(PORT, HOST, () => {
  console.log(`[socket] HayMarket chat server on ${HOST}:${PORT}`);
});
