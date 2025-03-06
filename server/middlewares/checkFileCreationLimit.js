import File from "../models/File.js";
import User from "../models/User.js";

export const checkFileCreationLimit = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming you have authentication middleware that sets req.user

    // Find the user to check their subscription
    const user = await User.findById(userId);

    // Count existing files for this user
    const existingFileCount = await File.countDocuments({ userId });

    // Check if user can create more files based on their subscription
    if (existingFileCount >= user.subscription.maxFiles) {
      return res.status(403).json({
        message:
          "File creation limit reached. Upgrade to premium to create more files.",
        currentPlan: user.subscription.plan,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Error checking file creation limit",
      error: error.message,
    });
  }
};
