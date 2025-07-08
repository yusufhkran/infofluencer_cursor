import React from "react";

const YouTubeCard = ({ connected, onConnect, isLoading }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
        <span className="text-2xl">▶️</span>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          YouTube Analytics
        </h2>
        <p className="text-sm text-gray-600">Channel analytics and insights</p>
      </div>
    </div>
    {connected ? (
      <div className="flex items-center mb-4">
        <span className="text-green-600 font-medium">✅ Connected</span>
      </div>
    ) : (
      <button
        onClick={onConnect}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Connecting..." : "Connect YouTube"}
      </button>
    )}
  </div>
);

export default YouTubeCard;
