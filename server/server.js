const express = require("express");
const { join } = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Mimic Vercel's API folder structure
app.use("/api/auth/signup", require("./api/auth/signup").default);
app.use("/api/auth/login", require("./api/auth/login").default);
app.use("/api/files", require("./api/files/index").default);
app.use("/api/files/:id", require("./api/files/[id]").default);
app.use("/api/execute", require("./api/execute").default);

// Serve static files if needed (optional for Vercel deployment)
app.use(express.static(join(__dirname, "public")));

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
