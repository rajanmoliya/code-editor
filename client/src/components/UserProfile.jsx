import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

/* eslint-disable */

const UserProfile = ({ filesCount, logout }) => {
  const { user, token, updateUserSubscription, resetUserSubscription } =
    useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const plan = user?.user.subscription?.plan || "free";
  const validTill = user?.user.subscription?.expiresAt
    ? new Date(user.user.subscription.expiresAt).toLocaleDateString("en-GB")
    : "N/A";

  // Handle logout with confirmation
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const initiateSubscription = async () => {
    try {
      setIsLoading(true);
      const api = axios.create({
        baseURL: import.meta.env.VITE_BACKEND_URL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Create subscription
      const response = await api.post("/subscription");
      const { subscriptionId, razorpayKeyId } = response.data;

      // Initialize Razorpay
      const options = {
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: "Online Code Editor",
        description: "Premium Subscription",

        handler: async function (response) {
          try {
            // Verify subscription
            const verifyResponse = await api.post("/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Update user subscription
            updateUserSubscription(verifyResponse.data.user.subscription);

            alert("Subscription activated successfully!");
          } catch (error) {
            console.error("Verification failed", error);
            alert("Subscription verification failed");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Subscription creation failed", error);
      alert("Failed to create subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      try {
        setIsLoading(true);
        const api = axios.create({
          baseURL: import.meta.env.VITE_BACKEND_URL,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Cancel subscription
        const response = await api.delete("/subscription");
        console.log(
          "Subscription cancelled RESPONSE",
          response.data.user.subscription
        );

        resetUserSubscription(response.data.user.subscription);
        alert("Subscription cancelled successfully");
      } catch (error) {
        console.error("Subscription cancellation failed", error);
        alert("Failed to cancel subscription");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Toggle expand/collapse state
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  // Sample additional user details
  const email = user?.user.email || "user@example.com";
  const joinDate = user?.user.createdAt
    ? new Date(user.user.createdAt).toLocaleDateString("en-GB")
    : "01/01/2024";
  const storageUsage = `${filesCount * 0.5}MB / 1GB`;

  return (
    <div className="absolute bottom-0 left-0 w-full flex flex-col items-start p-4">
      {" "}
      {/* Sidebar width set to 240px (w-60 in Tailwind) */}
      {/* Expanded/Collapsed Modal */}
      {isExpanded && (
        <div
          className="w-full bg-gray-900 rounded-t-lg shadow-xl border-t border-gray-600 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isExpanded ? "300px" : "0px", // Controls expand/collapse height
            transformOrigin: "bottom", // Animation origin from bottom
          }}
        >
          <div className="p-4 flex flex-col space-y-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-medium uppercase text-gray-200">
                  {user?.user.name[0] || "U"}
                </span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-base text-gray-100 truncate">
                  {user?.user.name || "User"}
                </h3>
                <span className="text-xs text-gray-400 uppercase">
                  {plan === "free" ? "Free Plan" : "Premium Plan"}
                </span>
                {/* {plan === "premium" && (
                  <span className="text-xs text-gray-400">
                    Valid Until: {validTill}
                  </span>
                )} */}
                {plan === "free" ? (
                  <span></span>
                ) : (
                  <span className="text-xs text-gray-400">
                    Valid Until: {validTill}
                  </span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-300 text-xs font-medium">
                {filesCount} Files
              </span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-gray-300 text-xs font-medium">Active</span>
            </div>

            {/* User Details */}
            <div className="space-y-2 text-xs text-gray-300">
              <p>Email: {email}</p>
              <p>Joined: {joinDate}</p>
              <p>Storage: {storageUsage}</p>
            </div>

            {/* Subscription Actions */}
            <div className="mt-3 space-y-2">
              {plan === "free" ? (
                <button
                  onClick={initiateSubscription}
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-purple-600 rounded-md text-sm font-medium text-white 
                            hover:bg-purple-700 active:bg-purple-800 transition-all duration-200 
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Processing..." : "Upgrade to Premium"}
                </button>
              ) : (
                <button
                  onClick={cancelSubscription}
                  className="w-full py-2 px-4 bg-teal-600 rounded-md text-sm font-medium text-white 
                            hover:bg-teal-700 active:bg-teal-800 transition-all duration-200 
                            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Processing..." : "Cancel Subscription"}
                </button>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-2 py-2 px-4 bg-red-600 rounded-md text-sm font-medium text-white 
                        hover:bg-red-700 active:bg-red-800 transition-all duration-200
                        focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:outline-none
                        flex items-center gap-2 justify-center"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
      {/* Profile Expand/Collapse Button (fixed at bottom) */}
      <button
        onClick={toggleExpand}
        className="w-full h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-between px-3 
                  ring-2 ring-gray-500 hover:ring-gray-400 transition-all duration-200 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-label="Expand/collapse user profile"
      >
        <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium uppercase text-gray-200">
            {user?.user.name[0] || "U"}
          </span>
        </div>
        <span className="text-sm font-medium uppercase text-gray-200 truncate">
          {user?.user.name || "User"}
        </span>
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span className="text-gray-300 text-xs font-medium">Active</span>
        <svg
          className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {/* Tooltip for Profile Button */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-xs text-gray-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {user?.user.name || "User Profile"}
      </div>
    </div>
  );
};

export default UserProfile;
