import React from "react";
import { Menu, RefreshCw, Bell, Settings, LogOut } from "lucide-react";
import ConnectionStatus from "./ConnectionStatus";

// TopBar: Analytics dashboard için üst bilgi çubuğu.

/**
 * TopBar componenti, başlık, kullanıcı bilgisi ve hızlı aksiyon butonlarını içerir.
 */
const TopBar = ({
  userType,
  user,
  setSidebarOpen,
  timeRange,
  setTimeRange,
  loadDashboardData,
  isLoading,
  connections,
  startAuth,
  setActiveTab,
  handleLogout,
}) => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 h-20">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4">
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userType === "company"
              ? "Firma Dashboard"
              : "Influencer Dashboard"}
          </h1>
          {user && (
            <p className="text-sm text-gray-600">
              Hoş geldin, {user.first_name || user.email}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* API Bağlantı Durumları */}
        <div className="flex items-center space-x-2">
          <ConnectionStatus
            type="ga4"
            connected={connections.ga4}
            onConnect={startAuth}
          />
          <ConnectionStatus
            type="youtube"
            connected={connections.youtube}
            onConnect={startAuth}
          />
          {userType === "company" && (
            <ConnectionStatus
              type="instagram"
              connected={connections.instagram}
              onConnect={startAuth}
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Son 7 gün</option>
            <option value="30d">Son 30 gün</option>
            <option value="90d">Son 90 gün</option>
            <option value="1y">Son yıl</option>
          </select>
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default TopBar;
