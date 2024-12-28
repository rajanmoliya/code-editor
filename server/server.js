import express from "express";
import dotenv from "dotenv";
import signup from "./api/auth/signup.js";
import login from "./api/auth/login.js";
import filesIndex from "./api/files/index.js";
import execute from "./api/execute.js";
import health from "./api/health.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({ origin: ["http://localhost:5173", "https://ide.rajanmoliya.me"] })
);

// Middleware to parse JSON request bodies
app.use(express.json());

// Mimic Vercel's API folder structure
app.use("/api/auth/signup", signup);
app.use("/api/auth/login", login);
app.use("/api/files", filesIndex);
app.use("/api/execute", execute);
app.use("/api/health", health);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
