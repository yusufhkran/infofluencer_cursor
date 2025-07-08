import React from "react";

const GA4Card = ({
  connected,
  ga4PropertyId,
  onConnect,
  onSavePropertyId,
  ga4PropertyIdInput,
  setGA4PropertyIdInput,
  isLoading,
  dataFetchInProgress,
}) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
        <span className="text-2xl">📊</span>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Google Analytics 4
        </h2>
        <p className="text-sm text-gray-600">Website analytics and insights</p>
      </div>
    </div>
    {connected ? (
      <div>
        <div className="flex items-center mb-4">
          <span className="text-green-600 font-medium">✅ Connected</span>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GA4 Property ID
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={ga4PropertyIdInput}
            onChange={(e) => setGA4PropertyIdInput(e.target.value)}
            disabled={!!ga4PropertyId || isLoading || dataFetchInProgress}
            placeholder="Enter your GA4 Property ID"
          />
          {ga4PropertyId && (
            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
              Saved
            </span>
          )}
        </div>
        <button
          onClick={onSavePropertyId}
          disabled={isLoading || dataFetchInProgress || !!ga4PropertyId}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {ga4PropertyId
            ? "Saved"
            : isLoading
              ? "Saving..."
              : "Save Property ID"}
        </button>
      </div>
    ) : (
      <button
        onClick={onConnect}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Connecting..." : "Connect Google Analytics 4"}
      </button>
    )}
  </div>
);

export default GA4Card;
