import connectDB from "../db.js";
import { auth } from "../middlewares/auth.middleware.js";
import { verifySubscription } from "../services/razorpay.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.method === "POST") {
    return auth(req, res, async () => {
      return verifySubscription(req, res);
    });
  }
}
