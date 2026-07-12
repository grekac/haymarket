import { createServer } from "http";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT || process.env.SOCKET_PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const httpServer = createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "text/plain" }).end("ok");
    return;
  }
  if (req.method === "POST" && req.url === "/emit") {
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
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  socket.on("join", (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
  });

  socket.on("leave", (conversationId: string) => {
    socket.leave(`conv:${conversationId}`);
  });

  socket.on("message", (data: { conversationId: string; message: unknown }) => {
    io.to(`conv:${data.conversationId}`).emit("message", data.message);
  });

  socket.on("typing", (data: { conversationId: string; userId: string }) => {
    socket.to(`conv:${data.conversationId}`).emit("typing", data);
  });

  socket.on("disconnect", () => {
    console.log(`[socket] disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`[socket] HayMarket chat server on ${HOST}:${PORT}`);
});
