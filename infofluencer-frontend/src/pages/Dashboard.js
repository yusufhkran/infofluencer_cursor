// infofluencer-frontend/src/pages/Dashboard.js - TAM ENTEGRASYONlu VERSİYON
// LOGOUT ve HATA YÖNETİMİ DAHİL

/**
 * Dashboard.js: Kullanıcıya genel analytics panelini sunan ana sayfa.
 *
 * Dashboard sayfası, kullanıcıya özet metrikler, analizler ve bağlantı durumlarını gösterir.
 * Alt componentler ile modüler ve okunabilir bir yapı sunar.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Target,
  Globe,
  Smartphone,
  Clock,
  Award,
  ChevronDown,
  RefreshCw,
  Download,
  Filter,
  Search,
  Bell,
  Settings,
  Menu,
  X,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  UserCheck,
  Zap,
  AlertCircle,
  CheckCircle,
  Instagram,
  Youtube,
  BarChart2,
  TrendingDown,
  Star,
  MapPin,
  DollarSign,
  Database,
  Wifi,
  WifiOff,
  Link,
  ExternalLink,
  Plus,
  LogOut,
} from "lucide-react";

import OverviewTab from "../components/Dashboard/OverviewTab";
import AnalizlerTab from "../components/Dashboard/AnalizlerTab";
import Sidebar from "../components/Dashboard/Sidebar";
import TopBar from "../components/Dashboard/TopBar";
import MetricCard from "../components/Dashboard/MetricCard";
import NoDataCard from "../components/Dashboard/NoDataCard";
import ConnectionStatus from "../components/Dashboard/ConnectionStatus";
import { formatNumber } from "../utils/format";
import { getTopN } from "../utils/array";
import { apiCall } from "../services/api";
import PieLabel from "../components/Dashboard/PieLabel";
import BarLabel from "../components/Dashboard/BarLabel";
import ReportsTab from '../components/Dashboard/ReportsTab';
import ConnectionsTab from '../components/Dashboard/ConnectionsTab';
import InfluencerMatchingTab from '../components/Dashboard/InfluencerMatchingTab';
import ComparisonTab from '../components/Dashboard/ComparisonTab';
import DataStatusTab from '../components/Dashboard/DataStatusTab';
import SettingsTab from '../components/Dashboard/SettingsTab';

// Bar chart renkleri
const barColors = [
  '#7C3AED', '#F59E42', '#10B981', '#F43F5E', '#6366F1', '#FBBF24', '#3B82F6', '#EF4444', '#22D3EE', '#A21CAF'
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [userType, setUserType] = useState("company");
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // API bağlantı durumları
  const [connections, setConnections] = useState({
    ga4: false,
    youtube: false,
    instagram: false,
  });

  // Gerçek veri state'leri
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    audience: null,
    traffic: null,
    reports: null,
    hasData: false,
    lastUpdated: null,
  });

  // GA4 property id kontrolü için state
  const [ga4PropertyId, setGA4PropertyId] = useState(null);

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  // Token utilities
  const getAccessToken = () => localStorage.getItem("access_token");
  const getUserData = () => {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  };

  // Logout fonksiyonu
  const handleLogout = () => {
    try {
      // Token ve user data'yı temizle
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("refresh_token"); // varsa
      
      // State'leri sıfırla
      setUser(null);
      setDashboardData({
        overview: null,
        audience: null,
        traffic: null,
        reports: null,
        hasData: false,
        lastUpdated: null,
      });
      setConnections({
        ga4: false,
        youtube: false,
        instagram: false,
      });
      
      // Login sayfasına yönlendir
      navigate("/login");
      
      showMessage("Başarıyla çıkış yapıldı", "success");
    } catch (error) {
      console.error("Logout error:", error);
      // Yine de login'e yönlendir
      navigate("/login");
    }
  };

  // Mesaj gösterme fonksiyonu
  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  // Bağlantı durumlarını kontrol et - Geliştirilmiş
  const checkConnections = useCallback(async () => {
    try {
      const response = await apiCall("/api/company/analytics/connections/");
      if (response.success) {
        setConnections(response.connections);
      }
    } catch (error) {
      console.error("Failed to check connections:", error);
      
      // 500 hatası durumunda varsayılan değerler kullan
      if (error.message.includes("500")) {
        console.warn("Connections endpoint not available, using defaults");
        setConnections({
          ga4: false,
          youtube: false,
          instagram: false,
        });
        // Kullanıcıya mesaj gösterme - bu normal bir durum olabilir
      } else {
        showMessage("Bağlantı durumu kontrol edilemedi", "warning");
      }
    }
  }, []);

  // Dashboard verilerini yükle
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (userType === "influencer") {
        // Influencer verileri
        const result = await apiCall("/api/influencer/dashboard/overview/");
        setDashboardData({
          overview: result.success ? result : null,
          hasData: result.success && result.data,
          lastUpdated: new Date().toISOString(),
        });
        return;
      }

      // Company verileri - paralel çek
      const [overviewResult, audienceResult, trafficResult] =
        await Promise.allSettled([
          apiCall("/api/company/dashboard/overview/"),
          apiCall("/api/company/dashboard/audience/combined/"),
          apiCall("/api/company/dashboard/traffic/"),
      ]);

      const newDashboardData = {
        overview:
          overviewResult.status === "fulfilled" ? overviewResult.value : null,
        audience:
          audienceResult.status === "fulfilled" ? audienceResult.value : null,
        traffic:
          trafficResult.status === "fulfilled" ? trafficResult.value : null,
        hasData: false,
        lastUpdated: new Date().toISOString(),
      };

      // Herhangi bir veri var mı kontrol et
      newDashboardData.hasData = !!(
        (newDashboardData.overview?.success &&
          newDashboardData.overview?.data) ||
        (newDashboardData.audience?.success &&
          newDashboardData.audience?.data) ||
        (newDashboardData.traffic?.success && newDashboardData.traffic?.data)
      );

      setDashboardData(newDashboardData);
      
      if (newDashboardData.hasData) {
        showMessage("Dashboard verileri başarıyla yüklendi", "success");
      }
    } catch (error) {
      setError("Dashboard verileri yüklenemedi");
      showMessage("Dashboard verileri yüklenemedi", "error");
      console.error("Dashboard data loading failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userType]);

  // Tüm verileri çek
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      showMessage("Tüm analytics verileri çekiliyor...", "info");
      
      const response = await apiCall("/api/company/dashboard/fetch-all/", {
        method: "POST",
      });
      
      if (response.success) {
        showMessage(
          `Veri çekme tamamlandı! ${response.data.successful_reports} rapor başarıyla çekildi.`,
          "success",
        );
        // 2 saniye sonra dashboard verilerini yenile
        setTimeout(() => {
          loadDashboardData();
        }, 2000);
      } else {
        showMessage(response.message || "Veri çekme başarısız", "error");
      }
    } catch (error) {
      showMessage("Veri çekme sırasında hata oluştu", "error");
      console.error("Data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadDashboardData]);

  // Component mount
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      setUserType(userData.user_type || "company");
    } else {
      // User data yoksa login'e yönlendir
      navigate("/login");
      return;
    }
    
    checkConnections();
    loadDashboardData();

    // URL parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("ga4_connected") === "true") {
      showMessage("GA4 başarıyla bağlandı!", "success");
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkConnections, 1000);
    }
    if (urlParams.get("youtube_connected") === "true") {
      showMessage("YouTube başarıyla bağlandı!", "success");
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkConnections, 1000);
    }
    if (urlParams.get("error")) {
      showMessage("Bağlantı kurulurken hata oluştu", "error");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkConnections, loadDashboardData, navigate]);

  // Test için geçici auth fonksiyonu
  const startAuthTest = async (platform) => {
    try {
      setIsLoading(true);
      showMessage(
        `${platform.toUpperCase()} test bağlantısı başlatılıyor...`,
        "info",
      );
      
      // Test URL - gerçek auth URL'inizi buraya yazın
      const testAuthUrl =
        "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=836251990660-9edbrh38ehul6l3rxxxxxxx.apps.googleusercontent.com&redirect_uri=http://127.0.0.1:8000/api/company/auth/ga4/callback/&scope=openid%20email%20profile%20https://www.googleapis.com/auth/analytics.readonly&access_type=offline&prompt=consent";
      
      console.log(`Test redirect to: ${testAuthUrl}`);
      
      // Doğrudan yönlendir
      window.location.href = testAuthUrl;
    } catch (error) {
      console.error(`${platform} test auth error:`, error);
      showMessage(
        `${platform.toUpperCase()} test bağlantı hatası: ${error.message}`,
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // API Authentication functions - Geliştirilmiş versiyon
  const startAuth = async (platform) => {
    try {
      setIsLoading(true);
      showMessage(
        `${platform.toUpperCase()} bağlantısı başlatılıyor...`,
        "info",
      );
      
      console.log(`Starting ${platform} auth...`);
      
      const response = await apiCall(`/api/company/auth/${platform}/start/`, {
        method: "POST",
      });
      
      console.log(`${platform} auth response:`, response);
      
      if (response.success && response.data?.auth_url) {
        console.log(`Redirecting to: ${response.data.auth_url}`);
        showMessage(
          `${platform.toUpperCase()} yetkilendirme sayfasına yönlendiriliyor...`,
          "info",
        );
        
        // Yönlendirme yapmadan önce kısa bir delay
        setTimeout(() => {
          window.location.href = response.data.auth_url;
        }, 500);
      } else {
        console.error(`${platform} auth failed:`, response);
        showMessage(
          `${platform.toUpperCase()} bağlantısı başlatılamadı: ${response.message || "Bilinmeyen hata"}`,
          "error",
        );
        
        // Test fonksiyonunu dene
        console.log("Trying test auth...");
        startAuthTest(platform);
      }
    } catch (error) {
      console.error(`${platform} auth error:`, error);
      showMessage(
        `${platform.toUpperCase()} bağlantı hatası: ${error.message}`,
        "error",
      );
      
      // Hata durumunda test fonksiyonunu dene
      console.log("Error occurred, trying test auth...");
      startAuthTest(platform);
    } finally {
      setIsLoading(false);
    }
  };

  // Renk şeması - Mor ve Turuncu odaklı
  const colors = {
    primary: "#8B5CF6", // Mor
    secondary: "#F97316", // Turuncu
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
    gray: "#6B7280",
  };

  // Company sidebar menü
  const companyMenuItems = [
    { id: "overview", label: "Genel Bakış", icon: TrendingUp },
    { id: "analizler", label: "Analizler", icon: PieChartIcon },
    {
      id: "influencer-matching",
      label: "Influencer Eşleştirme",
      icon: UserCheck,
    },
    { id: "comparison", label: "Karşılaştırma", icon: Activity },
    { id: "data-status", label: "Veri Güncelleme Durumu", icon: Database },
    { id: "connections", label: "Bağlantılar", icon: Link },
    { id: "settings", label: "Ayarlar", icon: Settings },
  ];

  // Influencer sidebar menü
  const influencerMenuItems = [
    { id: "overview", label: "Genel Bakış", icon: TrendingUp },
    {
      id: "performance",
      label: "Performans Raporları",
      icon: BarChart3,
      submenu: [
        { id: "instagram", label: "Instagram", icon: Instagram },
        { id: "tiktok", label: "TikTok", icon: Activity },
        { id: "youtube", label: "YouTube", icon: Youtube },
      ],
    },
    {
      id: "category-comparison",
      label: "Kategori Karşılaştırması",
      icon: Activity,
    },
    { id: "growth-suggestions", label: "Gelişim Önerileri", icon: Zap },
    { id: "profile-settings", label: "Profil Ayarları", icon: Settings },
  ];

  const menuItems =
    userType === "company" ? companyMenuItems : influencerMenuItems;

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            connections={connections}
            dashboardData={dashboardData}
            startAuth={startAuth}
            fetchAllData={fetchAllData}
            isLoading={isLoading}
            setActiveTab={setActiveTab}
            formatNumber={formatNumber}
          />
        );
      case "analizler":
      return (
          <AnalizlerTab
            connections={connections}
            dashboardData={dashboardData}
            getTopN={getTopN}
            barColors={barColors}
            BarLabel={BarLabel}
          />
        );
      case "reports":
        return <ReportsTab />;
      case "connections":
        return <ConnectionsTab />;
      case "influencer-matching":
        return <InfluencerMatchingTab />;
      case "comparison":
        return <ComparisonTab />;
      case "data-status":
        return <DataStatusTab />;
      case "settings":
      case "profile-settings":
        return <SettingsTab />;
      default:
        return null;
    }
  };

  // Loading state kontrolü
  if (isLoading && !dashboardData.lastUpdated) {
    // Bağlantı yoksa uyarı göster
    if (!connections.ga4 && !connections.youtube) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="rounded-full h-16 w-16 bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-orange-500">⚠️</span>
            </div>
            <p className="text-orange-700 font-semibold text-lg">
              Henüz analiz hesaplarınızı bağlamadınız.
            </p>
            <p className="text-gray-600 mt-2">
              Analizleri görebilmek için Google Analytics veya YouTube
              hesabınızı bağlayın.
            </p>
          </div>
        </div>
      );
    }
    // Bağlantı varsa klasik yükleniyor animasyonu
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Token kontrolü - eğer token yoksa login'e yönlendir
  if (!getAccessToken()) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar onNavigate={route => navigate(route)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar connections={connections} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
