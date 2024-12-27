require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");
const User = require("./models/User");
const File = require("./models/File");
const { auth } = require("./middlewares/auth.middleware");


const app = express();
app.use(cors());
app.use(express.json());

connectDB().catch((err) => console.error("MongoDB connection error:", err));

// Auth routes
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, "your_jwt_secret");
    res.json({ user: { id: user._id, email }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret");
    res.json({ user: { id: user._id, email }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// File routes
app.get("/files", auth, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/files", auth, async (req, res) => {
  try {
    const file = new File({
      ...req.body,
      userId: req.user._id,
    });
    await file.save();
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/files/:id", auth, async (req, res) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, lastModified: new Date() },
      { new: true }
    );
    if (!file) throw new Error("File not found");
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/files/:id", auth, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!file) throw new Error("File not found");
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Code execution endpoint
app.post("/execute", auth, async (req, res) => {
  const { code, language } = req.body;
  const { exec } = require("child_process");
  const fs = require("fs").promises;

  const filename = `temp_${Date.now()}`;

  const fileExtensions = {
    javascript: "js",
    python: "py",
    cpp: "cpp",
  };

  const commands = {
    javascript: `node ${filename}.js`,
    python: `python ${filename}.py`,
    cpp: `g++ ${filename}.cpp -o ${filename}.exe && ${filename}.exe`,
  };

  try {
    await fs.writeFile(`${filename}.${fileExtensions[language]}`, code);
    exec(commands[language], async (error, stdout, stderr) => {
      await fs.unlink(`${filename}.${fileExtensions[language]}`);
      if (language === "cpp") {
        await fs.unlink(`${filename}.exe`).catch(() => {});
      }

      if (error) return res.status(500).json({ error: stderr });
      res.json({ output: stdout });
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
