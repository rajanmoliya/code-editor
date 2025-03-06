import { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

// eslint-disable-next-line
const SubscriptionModal = ({ isOpen, onClose, onUpgrade }) => {
  const { token, updateUserSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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

            console.log(
              "Subscription verified RESPONSE",
              verifyResponse.data.user.subscription
            );

            // Update user subscription
            updateUserSubscription(verifyResponse.data.user.subscription);

            // Close modal and show success
            onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-in-out text-center">
        {/* Plan Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-t-2xl text-white mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Premium Plan</h2>
          <p className="text-sm font-medium mt-1">
            <span className="text-lg">₹2499</span>/year or{" "}
            <span className="text-lg">₹299</span>/month
          </p>
        </div>

        {/* Benefits Section */}
        <div className="p-4 space-y-2 ">
          <p className="text-white text-lg font-semibold mb-4">Why Upgrade?</p>
          <ul className="flex text-white text-sm">
            <li className="grid items-center ">
              <span className="text-green-500">✔</span> Unlimited File Creation
            </li>
            <li className="grid items-center ">
              <span className="text-green-500">✔</span> Advanced Code Features
            </li>
            <li className="grid items-center ">
              <span className="text-green-500">✔</span> 24/7 Customer Support
            </li>
            <li className="grid items-center ">
              <span className="text-green-500">✔</span> 1TB Cloud Storage
            </li>
          </ul>
        </div>

        {/* Current Status and Call to Action */}
        <div className="p-4 border-t border-gray-600">
          <p className="text-yellow-500 text-sm mb-6">
            You&apos;ve reached the limit of 3 files on your Free plan.
            <br />
            Upgrade now to unlock all premium features!
          </p>
          <div className="flex justify-between gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 hover:scale-[1.02]"
            >
              Cancel
            </button>
            <button
              onClick={initiateSubscription}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02]"
            >
              {isLoading ? "Processing..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
