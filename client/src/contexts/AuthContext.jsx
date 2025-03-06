import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

// eslint-disable-next-line
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    // Ensure subscription is initialized if not present
    if (!userData.user.subscription) {
      userData.subscription = {
        plan: "free",
        maxFiles: 3,
      };
    }
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const token =
    // user?.token ||
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).token
      : null;

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("chatMessages");
    setUser(null);
    navigate("/login");
  };

  const updateUserSubscription = (subscriptionData) => {
    // Create a deep copy of the current user
    const updatedUser = JSON.parse(JSON.stringify(user));

    // Update the subscription
    updatedUser.user.subscription = {
      ...updatedUser.subscription,
      ...subscriptionData,
      plan: "premium",
      maxFiles: 999,
    };

    // Update both state and local storage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const resetUserSubscription = (cancelData) => {
    // Create a deep copy of the current user
    const updatedUser = JSON.parse(JSON.stringify(user));

    // Reset the subscription
    updatedUser.user.subscription = {
      ...cancelData,
    };

    // Update both state and local storage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        token,
        updateUserSubscription,
        resetUserSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
