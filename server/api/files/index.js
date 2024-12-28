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

  if (req.method === "PUT") {
    return auth(req, res, async () => {
      const { id } = req.query;
      const file = await File.findOneAndUpdate(
        { _id: id, userId: req.user._id },
        { ...req.body, lastModified: new Date() },
        { new: true }
      );
      if (!file) return res.status(404).json({ error: "File not found" });
      res.json(file);
    });
  }

  if (req.method === "DELETE") {
    return auth(req, res, async () => {
      const { id } = req.query;
      const file = await File.findOneAndDelete({
        _id: id,
        userId: req.user._id,
      });
      if (!file) return res.status(404).json({ error: "File not found" });
      res.json({ message: "File deleted successfully" });
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
