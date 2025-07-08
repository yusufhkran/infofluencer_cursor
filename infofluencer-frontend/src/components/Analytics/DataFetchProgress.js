import React from "react";

const DataFetchProgress = () => (
  <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-center gap-3 mb-3">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      <h3 className="font-semibold text-blue-900">
        Fetching Your Analytics Data
      </h3>
    </div>
    <p className="text-blue-700 text-sm mb-3">
      We're automatically collecting all your GA4 data including:
    </p>
    <ul className="text-sm text-blue-600 grid grid-cols-2 gap-2">
      <li>• User acquisition sources</li>
      <li>• Geographic data</li>
      <li>• Device categories</li>
      <li>• Age demographics</li>
      <li>• Session sources</li>
      <li>• Operating systems</li>
      <li>• Traffic analysis</li>
      <li>• Engagement metrics</li>
    </ul>
    <p className="text-blue-700 text-sm mt-3">
      This will take a few moments. You'll be redirected to your dashboard
      automatically.
    </p>
  </div>
);

export default DataFetchProgress;
