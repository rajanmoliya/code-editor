import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import File from "./models/File.js";
import signup from "./api/auth/signup.js";
import login from "./api/auth/login.js";
import filesIndex from "./api/files/index.js";
import execute from "./api/execute.js";
import health from "./api/health.js";
import User from "./models/User.js";
import connectDB from "./db.js";
import { WebSocket, WebSocketServer } from "ws";

dotenv.config();

connectDB();

const port = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://ide.rajanmoliya.me"],
    credentials: true,
  })
);
app.use(express.json());

const httpServer = createServer(app);

// create a new web socket server using the server
const wss = new WebSocketServer({ server: httpServer });

const clients = new Map(); // Store connected users

wss.on("connection", (ws, req) => {
  const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get(
    "token"
  );

  if (!token) {
    ws.close();
    return;
  }

  try {
    // Decode JWT and extract user details
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ws.userId = decoded.userId;
    ws.username = decoded.name;

    clients.set(ws.userId, ws);
    console.log(`${ws.username} connected`);

    // Send updated online users list to everyone
    broadcastOnlineUsers();

    ws.on("message", (msg) => {
      const data = JSON.parse(msg);

      if (data.type === "private_chat") {
        sendPrivateMessage(ws.userId, data.recipientId, data.message);
      }
    });

    ws.on("close", () => {
      clients.delete(ws.userId);
      console.log(`${ws.username} disconnected`);
      broadcastOnlineUsers();
    });
  } catch (error) {
    ws.close();
  }
});

// Function to send private messages
function sendPrivateMessage(senderId, recipientId, message) {
  const recipientSocket = clients.get(recipientId);
  const senderSocket = clients.get(senderId);

  if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
    recipientSocket.send(
      JSON.stringify({ type: "private_chat", senderId, message })
    );
  }

  if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
    senderSocket.send(
      JSON.stringify({ type: "private_chat", senderId, message })
    );
  }
}

// Send updated online users to all clients
function broadcastOnlineUsers() {
  const users = Array.from(clients.keys()).map((userId) => ({
    id: userId,
    username: clients.get(userId).username,
  }));

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "online_users", users }));
    }
  });
}

app.use("/api/auth/signup", signup);
app.use("/api/auth/login", login);
app.use("/api/files", filesIndex);
app.use("/api/execute", execute);
app.use("/api/health", health);

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
