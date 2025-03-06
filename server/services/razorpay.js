import Razorpay from "razorpay";
import dotenv from "dotenv";
import User from "../models/User.js";
import crypto from "crypto";

dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createSubscription = async (req, res) => {
  try {
    // Create a Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PREMIUM_PLAN_ID, // You need to create this plan in Razorpay dashboard
      customer_notify: 1,
      total_count: 12, // Number of billing cycles (1 year)
    });

    // Update user with subscription details
    await User.findByIdAndUpdate(req.user.userId, {
      "subscription.razorpaySubscriptionId": subscription.id,
      "subscription.plan": "pending",
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Subscription creation failed", error: error.message });
  }
};

export const verifySubscription = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid signature",
      });
    }

    // Fetch the subscription details from Razorpay
    const subscription = await razorpay.subscriptions.fetch(
      razorpay_subscription_id
    );

    // Check if the subscription is active
    if (subscription.status !== "active") {
      return res.status(400).json({
        status: "failed",
        message: "Subscription is not active",
      });
    }

    // Update user's subscription status
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        "subscription.plan": "premium",
        "subscription.maxFiles": 999,
        "subscription.razorpaySubscriptionId": razorpay_subscription_id,
        "subscription.expiresAt": new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ),
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    res.status(200).json({
      message: "Subscription verified",
      user: {
        ...updatedUser.toObject(),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: user.subscription.plan,
      expiresAt: user.subscription.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the subscription details from Razorpay
    const subscription = await razorpay.subscriptions.fetch(
      user.subscription.razorpaySubscriptionId
    );

    // Cancel the subscription
    await razorpay.subscriptions.cancel(subscription.id);

    // Update user's subscription status
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        "subscription.plan": "free",
        "subscription.maxFiles": 3,
        "subscription.razorpaySubscriptionId": null,
        "subscription.expiresAt": null,
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    res.status(200).json({
      message: "Subscription cancelled",
      user: {
        ...updatedUser.toObject(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
