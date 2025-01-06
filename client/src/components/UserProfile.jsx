import React from "react";

const UserProfile = ({ user, filesCount, logout }) => {
  return (
    <div className="bg-gray-700 text-white rounded-lg p-3">
      <div className="flex items-center gap-3">
        {/* Left section - Avatar and User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-medium">
              {user?.user.name[0].toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {user?.user.name || "User"}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-xs">{filesCount} Files</span>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              <span className="text-gray-300 text-xs">Active</span>
            </div>
          </div>
        </div>

        {/* Right section - Logout Button */}
        <button
          onClick={logout}
          className="p-2 bg-red-500 rounded text-xs font-medium 
                   hover:bg-red-600 transition-colors duration-200
                   focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:outline-none"
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
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
