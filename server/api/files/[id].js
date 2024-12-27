import connectDB from "../../db";
import File from "../../models/File";
import { auth } from "../../middlewares/auth.middleware";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "PUT") {
    return auth(req, res, async () => {
      const file = await File.findOneAndUpdate(
        { _id: req.query.id, userId: req.user._id },
        { ...req.body, lastModified: new Date() },
        { new: true }
      );
      if (!file) throw new Error("File not found");
      res.json(file);
    });
  }

  if (req.method === "DELETE") {
    return auth(req, res, async () => {
      const file = await File.findOneAndDelete({
        _id: req.query.id,
        userId: req.user._id,
      });
      if (!file) throw new Error("File not found");
      res.json(file);
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
