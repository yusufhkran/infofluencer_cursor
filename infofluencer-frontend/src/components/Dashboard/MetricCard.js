import React from "react";

// MetricCard: Özet metrikleri gösteren kart bileşeni.

/**
 * MetricCard componenti, dashboard'da öne çıkan metrikleri (kullanıcı, oturum, oranlar) kutu şeklinde gösterir.
 */

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "primary",
  trend = "up",
  hasData = false,
}) => (
  <div
    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-start ${!hasData ? "opacity-60" : ""}`}
  >
    <div className="flex items-center mb-2">
      <Icon
        className={`w-7 h-7 mr-3 ${color === "primary" ? "text-purple-600" : color === "info" ? "text-blue-600" : color === "secondary" ? "text-orange-500" : color === "warning" ? "text-yellow-500" : ""}`}
      />
      <span className="text-lg font-semibold text-gray-900">{title}</span>
    </div>
    <div className="flex items-end justify-between w-full mt-2">
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      {change !== null && change !== undefined && (
        <span
          className={`ml-2 text-sm font-medium flex items-center ${change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500"}`}
        >
          {trend === "up"
            ? change > 0
              ? "▲"
              : change < 0
                ? "▼"
                : "•"
            : change < 0
              ? "▼"
              : change > 0
                ? "▲"
                : "•"}
          {Math.abs(change)}%
        </span>
      )}
    </div>
  </div>
);

export default MetricCard;
