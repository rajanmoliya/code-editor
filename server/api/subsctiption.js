import connectDB from "../db.js";
import { auth } from "../middlewares/auth.middleware.js";
import {
  cancelSubscription,
  createSubscription,
  getSubscriptionStatus,
} from "../services/razorpay.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    return auth(req, res, async () => {
      return createSubscription(req, res);
    });
  }

  if (req.method === "GET") {
    return auth(req, res, async () => {
      return getSubscriptionStatus(req, res);
    });
  }

  if (req.method === "DELETE") {
    return auth(req, res, async () => {
      return cancelSubscription(req, res);
    });
  }
}
