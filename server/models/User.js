import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscription: {
      type: {
        plan: {
          type: String,
          enum: ["free", "premium"],
          default: "free",
        },
        maxFiles: {
          type: Number,
          default: 3,
        },
        expiresAt: {
          type: Date,
        },
        razorpaySubscriptionId: {
          type: String,
        },
      },
      default: {},
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
