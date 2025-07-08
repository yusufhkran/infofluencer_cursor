import React from "react";
import {
  WifiOff,
  BarChart3,
  Youtube,
  Instagram,
  CheckCircle,
  AlertCircle,
  Heart,
  Users,
  Eye,
  TrendingDown,
  RefreshCw,
  Download,
} from "lucide-react";
import MetricCard from "./MetricCard";
import NoDataCard from "./NoDataCard";

// OverviewTab: Analytics dashboard için özet metriklerin ve genel bakışın gösterildiği sekme.

/**
 * OverviewTab componenti, toplam kullanıcı, oturum, etkileşim oranı gibi özet metrikleri ve genel bakış kartlarını içerir.
 */
const OverviewTab = ({
  connections,
  dashboardData,
  startAuth,
  fetchAllData,
  isLoading,
  setActiveTab,
  formatNumber,
}) => {
  const hasAnyConnection =
    connections.ga4 || connections.youtube || connections.instagram;
  const hasOverviewData =
    dashboardData.overview?.success && dashboardData.overview?.data;

  if (!hasAnyConnection) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <WifiOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            API Bağlantısı Bulunamadı
          </h2>
          <p className="text-gray-600 mb-6">
            Dashboard verilerini görüntülemek için önce GA4, YouTube veya
            Instagram bağlantınızı kurmanız gerekiyor.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => startAuth("ga4")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              GA4 Bağla
            </button>
            <button
              onClick={() => startAuth("youtube")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <Youtube className="w-5 h-5 mr-2" />
              YouTube Bağla
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bağlantı Durumu Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-2xl border-2 ${connections.ga4 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <BarChart3
              className={`w-8 h-8 ${connections.ga4 ? "text-green-600" : "text-gray-400"}`}
            />
            {connections.ga4 ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Google Analytics 4
          </h3>
          <p
            className={`text-sm ${connections.ga4 ? "text-green-600" : "text-gray-500"}`}
          >
            {connections.ga4 ? "Bağlı ve veri çekiyor" : "Bağlantı kurulmamış"}
          </p>
          {!connections.ga4 && (
            <button
              onClick={() => startAuth("ga4")}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              Bağla
            </button>
          )}
        </div>
        <div
          className={`p-6 rounded-2xl border-2 ${connections.youtube ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <Youtube
              className={`w-8 h-8 ${connections.youtube ? "text-red-600" : "text-gray-400"}`}
            />
            {connections.youtube ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            YouTube Analytics
          </h3>
          <p
            className={`text-sm ${connections.youtube ? "text-green-600" : "text-gray-500"}`}
          >
            {connections.youtube
              ? "Bağlı ve veri çekiyor"
              : "Bağlantı kurulmamış"}
          </p>
          {!connections.youtube && (
            <button
              onClick={() => startAuth("youtube")}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Bağla
            </button>
          )}
        </div>
        <div
          className={`p-6 rounded-2xl border-2 ${connections.instagram ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <Instagram
              className={`w-8 h-8 ${connections.instagram ? "text-pink-600" : "text-gray-400"}`}
            />
            {connections.instagram ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Instagram Business
          </h3>
          <p
            className={`text-sm ${connections.instagram ? "text-green-600" : "text-gray-500"}`}
          >
            {connections.instagram
              ? "Bağlı ve veri çekiyor"
              : "Yakında geliyor"}
          </p>
          {!connections.instagram && (
            <button
              disabled
              className="mt-3 px-4 py-2 bg-gray-400 text-white rounded-lg text-sm cursor-not-allowed"
            >
              Yakında
            </button>
          )}
        </div>
      </div>
      {/* Ana Metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Toplam Oturum"
          value={
            hasOverviewData
              ? formatNumber(dashboardData.overview.data.totalSessions)
              : "--"
          }
          change={
            hasOverviewData ? dashboardData.overview.data.sessionGrowth : null
          }
          icon={Eye}
          color="primary"
          hasData={hasOverviewData}
        />
        <MetricCard
          title="Aktif Kullanıcı"
          value={
            hasOverviewData
              ? formatNumber(dashboardData.overview.data.activeUsers)
              : "--"
          }
          change={
            hasOverviewData ? dashboardData.overview.data.userGrowth : null
          }
          icon={Users}
          color="info"
          hasData={hasOverviewData}
        />
        <MetricCard
          title="Etkileşim Oranı"
          value={
            hasOverviewData
              ? `${dashboardData.overview.data.engagementRate}%`
              : "--"
          }
          change={
            hasOverviewData
              ? dashboardData.overview.data.engagementGrowth
              : null
          }
          icon={Heart}
          color="secondary"
          hasData={hasOverviewData}
        />
        <MetricCard
          title="Çıkış Oranı"
          value={
            hasOverviewData
              ? `${dashboardData.overview.data.bounceRate}%`
              : "--"
          }
          change={
            hasOverviewData ? dashboardData.overview.data.bounceGrowth : null
          }
          icon={TrendingDown}
          color="warning"
          trend="down"
          hasData={hasOverviewData}
        />
      </div>
      {/* Veri yok durumu */}
      {hasAnyConnection && !dashboardData.hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NoDataCard
            title="Analytics Verisi Bulunamadı"
            description="Henüz analytics verisi çekilmemiş. Verilerinizi almak için aşağıdaki butona tıklayın."
            icon={BarChart3}
            actionText="Tüm Verileri Çek"
            onAction={fetchAllData}
          />
          <NoDataCard
            title="Rapor Verisi Bulunamadı"
            description="Detaylı raporlar için Raporlarım sekmesini ziyaret edin."
            icon={Download}
            actionText="Raporlara Git"
            onAction={() => setActiveTab("reports")}
          />
        </div>
      )}
      {/* Hızlı Veri Çekme */}
      {hasAnyConnection && (
        <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Veri Güncelleme
              </h3>
              <p className="text-gray-600">
                Tüm bağlı platformlardan güncel verileri çekin
              </p>
            </div>
            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg hover:from-purple-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 flex items-center"
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Çekiliyor..." : "Verileri Güncelle"}
            </button>
          </div>
        </div>
      )}
      {/* Son güncelleme bilgisi */}
      {dashboardData.lastUpdated && (
        <div className="text-center text-sm text-gray-500">
          Son güncelleme:{" "}
          {new Date(dashboardData.lastUpdated).toLocaleString("tr-TR")}
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
