import React from "react";
import {
  CheckCircle,
  AlertCircle,
  BarChart3,
  Youtube,
  Instagram,
} from "lucide-react";

// ConnectionStatus: GA4 ve YouTube bağlantı durumunu gösteren bilgi kutusu.

/**
 * ConnectionStatus componenti, kullanıcının GA4 ve YouTube bağlantı durumunu ve uyarı mesajlarını gösterir.
 */

const ConnectionStatus = ({ type, connected, onConnect }) => {
  let icon, label, color;
  switch (type) {
    case "ga4":
      icon = BarChart3;
      label = "GA4";
      color = connected ? "text-green-600" : "text-gray-400";
      break;
    case "youtube":
      icon = Youtube;
      label = "YouTube";
      color = connected ? "text-red-600" : "text-gray-400";
      break;
    case "instagram":
      icon = Instagram;
      label = "Instagram";
      color = connected ? "text-pink-600" : "text-gray-400";
      break;
    default:
      icon = BarChart3;
      label = "Bağlantı";
      color = "text-gray-400";
  }
  return (
    <button
      onClick={() => !connected && onConnect(type)}
      className={`flex items-center px-2 py-1 rounded-lg border ${connected ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"} transition-colors`}
      disabled={connected}
      title={connected ? `${label} bağlı` : `${label} bağlan`}
    >
      {React.createElement(icon, { className: `w-5 h-5 mr-1 ${color}` })}
      {connected ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <AlertCircle className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );
};

export default ConnectionStatus;
