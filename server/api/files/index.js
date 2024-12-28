import connectDB from "../../db.js";
import File from "../../models/File.js";
import { auth } from "../../middlewares/auth.middleware.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    return auth(req, res, async () => {
      const files = await File.find({ userId: req.user._id });
      res.json(files);
    });
  }

  if (req.method === "POST") {
    return auth(req, res, async () => {
      const file = new File({ ...req.body, userId: req.user._id });
      await file.save();
      res.json(file);
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
