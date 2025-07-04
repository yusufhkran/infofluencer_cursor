// infofluencer-frontend/src/pages/Dashboard.js - TAM ENTEGRASYONlu VERSİYON
// LOGOUT ve HATA YÖNETİMİ DAHİL

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, Users, Eye, Heart, MessageCircle, Share2, Calendar, Target, Globe, Smartphone, 
  Clock, Award, ChevronDown, RefreshCw, Download, Filter, Search, Bell, Settings, Menu, X,
  BarChart3, PieChart as PieChartIcon, Activity, UserCheck, Zap, AlertCircle, CheckCircle,
  Instagram, Youtube, BarChart2, TrendingDown, Star, MapPin, DollarSign, Database,
  Wifi, WifiOff, Link, ExternalLink, Plus, LogOut
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userType, setUserType] = useState('company');
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // API bağlantı durumları
  const [connections, setConnections] = useState({
    ga4: false,
    youtube: false,
    instagram: false
  });

  // Gerçek veri state'leri
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    audience: null,
    traffic: null,
    reports: null,
    hasData: false,
    lastUpdated: null
  });

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

  // Token utilities
  const getAccessToken = () => localStorage.getItem('access_token');
  const getUserData = () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  };

  // Logout fonksiyonu
  const handleLogout = () => {
    try {
      // Token ve user data'yı temizle
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('refresh_token'); // varsa
      
      // State'leri sıfırla
      setUser(null);
      setDashboardData({
        overview: null,
        audience: null,
        traffic: null,
        reports: null,
        hasData: false,
        lastUpdated: null
      });
      setConnections({
        ga4: false,
        youtube: false,
        instagram: false
      });
      
      // Login sayfasına yönlendir
      navigate('/login');
      
      showMessage('Başarıyla çıkış yapıldı', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      // Yine de login'e yönlendir
      navigate('/login');
    }
  };

  // Mesaj gösterme fonksiyonu
  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  // Geliştirilmiş API fonksiyonu
  const apiCall = async (endpoint, options = {}) => {
    try {
      const token = getAccessToken();
      
      if (!token) {
        // Token yoksa login'e yönlendir
        navigate('/login');
        throw new Error('No access token');
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      // 401 Unauthorized - Token geçersiz
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        navigate('/login');
        throw new Error('Unauthorized - redirecting to login');
      }

      // 403 Forbidden - Yetki yok
      if (response.status === 403) {
        showMessage('Bu işlem için yetkiniz bulunmuyor', 'error');
        throw new Error('Forbidden');
      }

      // 500 Internal Server Error
      if (response.status === 500) {
        console.error(`Server error on ${endpoint}:`, response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Bağlantı durumlarını kontrol et - Geliştirilmiş
  const checkConnections = useCallback(async () => {
    try {
      const response = await apiCall('/api/company/analytics/connections/');
      if (response.success) {
        setConnections(response.connections);
      }
    } catch (error) {
      console.error('Failed to check connections:', error);
      
      // 500 hatası durumunda varsayılan değerler kullan
      if (error.message.includes('500')) {
        console.warn('Connections endpoint not available, using defaults');
        setConnections({
          ga4: false,
          youtube: false,
          instagram: false
        });
        // Kullanıcıya mesaj gösterme - bu normal bir durum olabilir
      } else {
        showMessage('Bağlantı durumu kontrol edilemedi', 'warning');
      }
    }
  }, []);

  // Dashboard verilerini yükle
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (userType === 'influencer') {
        // Influencer verileri
        const result = await apiCall('/api/influencer/dashboard/overview/');
        setDashboardData({
          overview: result.success ? result : null,
          hasData: result.success && result.data,
          lastUpdated: new Date().toISOString()
        });
        return;
      }

      // Company verileri - paralel çek
      const [overviewResult, audienceResult, trafficResult] = await Promise.allSettled([
        apiCall('/api/company/dashboard/overview/'),
        apiCall('/api/company/dashboard/audience/'),
        apiCall('/api/company/dashboard/traffic/')
      ]);

      const newDashboardData = {
        overview: overviewResult.status === 'fulfilled' ? overviewResult.value : null,
        audience: audienceResult.status === 'fulfilled' ? audienceResult.value : null,
        traffic: trafficResult.status === 'fulfilled' ? trafficResult.value : null,
        hasData: false,
        lastUpdated: new Date().toISOString()
      };

      // Herhangi bir veri var mı kontrol et
      newDashboardData.hasData = !!(
        (newDashboardData.overview?.success && newDashboardData.overview?.data) ||
        (newDashboardData.audience?.success && newDashboardData.audience?.data) ||
        (newDashboardData.traffic?.success && newDashboardData.traffic?.data)
      );

      setDashboardData(newDashboardData);
      
      if (newDashboardData.hasData) {
        showMessage('Dashboard verileri başarıyla yüklendi', 'success');
      }
      
    } catch (error) {
      setError('Dashboard verileri yüklenemedi');
      showMessage('Dashboard verileri yüklenemedi', 'error');
      console.error('Dashboard data loading failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userType]);

  // Tüm verileri çek
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      showMessage('Tüm analytics verileri çekiliyor...', 'info');
      
      const response = await apiCall('/api/company/dashboard/fetch-all/', {
        method: 'POST'
      });
      
      if (response.success) {
        showMessage(`Veri çekme tamamlandı! ${response.data.successful_reports} rapor başarıyla çekildi.`, 'success');
        // 2 saniye sonra dashboard verilerini yenile
        setTimeout(() => {
          loadDashboardData();
        }, 2000);
      } else {
        showMessage(response.message || 'Veri çekme başarısız', 'error');
      }
    } catch (error) {
      showMessage('Veri çekme sırasında hata oluştu', 'error');
      console.error('Data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadDashboardData]);

  // Component mount
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      setUserType(userData.user_type || 'company');
    } else {
      // User data yoksa login'e yönlendir
      navigate('/login');
      return;
    }
    
    checkConnections();
    loadDashboardData();

    // URL parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ga4_connected') === 'true') {
      showMessage('GA4 başarıyla bağlandı!', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkConnections, 1000);
    }
    if (urlParams.get('youtube_connected') === 'true') {
      showMessage('YouTube başarıyla bağlandı!', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkConnections, 1000);
    }
    if (urlParams.get('error')) {
      showMessage('Bağlantı kurulurken hata oluştu', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkConnections, loadDashboardData, navigate]);

  // Test için geçici auth fonksiyonu
  const startAuthTest = async (platform) => {
    try {
      setIsLoading(true);
      showMessage(`${platform.toUpperCase()} test bağlantısı başlatılıyor...`, 'info');
      
      // Test URL - gerçek auth URL'inizi buraya yazın
      const testAuthUrl = "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=836251990660-9edbrh38ehul6l3rxxxxxxx.apps.googleusercontent.com&redirect_uri=http://127.0.0.1:8000/api/company/auth/ga4/callback/&scope=openid%20email%20profile%20https://www.googleapis.com/auth/analytics.readonly&access_type=offline&prompt=consent";
      
      console.log(`Test redirect to: ${testAuthUrl}`);
      
      // Doğrudan yönlendir
      window.location.href = testAuthUrl;
      
    } catch (error) {
      console.error(`${platform} test auth error:`, error);
      showMessage(`${platform.toUpperCase()} test bağlantı hatası: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // API Authentication functions - Geliştirilmiş versiyon
  const startAuth = async (platform) => {
    try {
      setIsLoading(true);
      showMessage(`${platform.toUpperCase()} bağlantısı başlatılıyor...`, 'info');
      
      console.log(`Starting ${platform} auth...`);
      
      const response = await apiCall(`/api/company/auth/${platform}/start/`, {
        method: 'POST'
      });
      
      console.log(`${platform} auth response:`, response);
      
      if (response.success && response.data?.auth_url) {
        console.log(`Redirecting to: ${response.data.auth_url}`);
        showMessage(`${platform.toUpperCase()} yetkilendirme sayfasına yönlendiriliyor...`, 'info');
        
        // Yönlendirme yapmadan önce kısa bir delay
        setTimeout(() => {
          window.location.href = response.data.auth_url;
        }, 500);
      } else {
        console.error(`${platform} auth failed:`, response);
        showMessage(`${platform.toUpperCase()} bağlantısı başlatılamadı: ${response.message || 'Bilinmeyen hata'}`, 'error');
        
        // Test fonksiyonunu dene
        console.log('Trying test auth...');
        startAuthTest(platform);
      }
    } catch (error) {
      console.error(`${platform} auth error:`, error);
      showMessage(`${platform.toUpperCase()} bağlantı hatası: ${error.message}`, 'error');
      
      // Hata durumunda test fonksiyonunu dene
      console.log('Error occurred, trying test auth...');
      startAuthTest(platform);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Renk şeması - Mor ve Turuncu odaklı
  const colors = {
    primary: '#8B5CF6', // Mor
    secondary: '#F97316', // Turuncu
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    gray: '#6B7280'
  };

  const ConnectionStatus = ({ type, connected, onConnect }) => (
    <div 
      onClick={() => !connected && onConnect && onConnect(type)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        connected 
          ? 'bg-green-50 text-green-700 border border-green-200' 
          : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
      }`}
    >
      {type === 'ga4' && <BarChart3 className="w-4 h-4" />}
      {type === 'youtube' && <Youtube className="w-4 h-4" />}
      {type === 'instagram' && <Instagram className="w-4 h-4" />}
      <span className="font-medium">{type.toUpperCase()}</span>
      {connected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {!connected && <Plus className="w-3 h-3 ml-1" />}
    </div>
  );

  const NoDataCard = ({ title, description, icon: Icon, actionText, onAction }) => (
    <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-dashed border-gray-200 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );

  const MetricCard = ({ title, value, change, icon: Icon, color = "primary", trend = "up", hasData = false }) => {
    if (!hasData) {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-50">
              <Icon className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-sm text-gray-400">Veri yok</div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-300">--</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl`} style={{ backgroundColor: `${colors[color]}20` }}>
            <Icon className="w-6 h-6" style={{ color: colors[color] }} />
          </div>
          {change && (
            <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {change}%
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    );
  };

  // Company sidebar menü
  const companyMenuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: TrendingUp },
    { id: 'reports', label: 'Raporlarım', icon: BarChart3, submenu: [
      { id: 'ga4', label: 'GA4', icon: BarChart2 },
      { id: 'youtube', label: 'YouTube', icon: Youtube },
      { id: 'instagram', label: 'Instagram', icon: Instagram }
    ]},
    { id: 'influencer-matching', label: 'Influencer Eşleştirme', icon: UserCheck },
    { id: 'comparison', label: 'Karşılaştırma', icon: Activity },
    { id: 'data-status', label: 'Veri Güncelleme Durumu', icon: Database },
    { id: 'settings', label: 'Ayarlar', icon: Settings }
  ];

  // Influencer sidebar menü
  const influencerMenuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: TrendingUp },
    { id: 'performance', label: 'Performans Raporları', icon: BarChart3, submenu: [
      { id: 'instagram', label: 'Instagram', icon: Instagram },
      { id: 'tiktok', label: 'TikTok', icon: Activity },
      { id: 'youtube', label: 'YouTube', icon: Youtube }
    ]},
    { id: 'category-comparison', label: 'Kategori Karşılaştırması', icon: Activity },
    { id: 'growth-suggestions', label: 'Gelişim Önerileri', icon: Zap },
    { id: 'profile-settings', label: 'Profil Ayarları', icon: Settings }
  ];

  const menuItems = userType === 'company' ? companyMenuItems : influencerMenuItems;

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200 h-20">
        <div className="flex items-center">
          {/* Logo */}
          <div className="w-10 h-10 mr-3 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="InfoFluencer Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback: Logo yüklenemezse gradyan background ile "i" harfi
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `
                  <div class="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-900 rounded-lg flex items-center justify-center">
                    <span class="text-white font-bold text-lg">i</span>
                  </div>
                `;
              }}
            />
          </div>
          {/* Brand Text */}
          <h2 className="text-xl font-bold flex items-center" style={{ 
            fontFamily: "'Torus Pro Bold', Arial, sans-serif",
            lineHeight: '1'
          }}>
            <span style={{ color: 'rgba(240,95,35,255)' }}>info</span>
            <span style={{ color: 'rgba(0,1,102,255)' }}>fluencer</span>
          </h2>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                activeTab === item.id 
                  ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600' 
                  : 'text-gray-600'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
              {item.submenu && <ChevronDown className="w-4 h-4 ml-auto" />}
            </button>
            {item.submenu && activeTab === item.id && (
              <div className="bg-gray-50">
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.id}
                    onClick={() => setActiveTab(subItem.id)}
                    className="w-full flex items-center px-12 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <subItem.icon className="w-4 h-4 mr-2" />
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );

  const TopBar = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 h-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userType === 'company' ? 'Firma Dashboard' : 'Influencer Dashboard'}
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
            {userType === 'company' && (
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
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {/* LOGOUT BUTONU */}
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

  const OverviewTab = () => {
    const hasAnyConnection = connections.ga4 || connections.youtube || connections.instagram;
    const hasOverviewData = dashboardData.overview?.success && dashboardData.overview?.data;

    if (!hasAnyConnection) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <WifiOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">API Bağlantısı Bulunamadı</h2>
            <p className="text-gray-600 mb-6">
              Dashboard verilerini görüntülemek için önce GA4, YouTube veya Instagram bağlantınızı kurmanız gerekiyor.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => startAuth('ga4')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                GA4 Bağla
              </button>
              <button
                onClick={() => startAuth('youtube')}
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
          <div className={`p-6 rounded-2xl border-2 ${connections.ga4 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className={`w-8 h-8 ${connections.ga4 ? 'text-green-600' : 'text-gray-400'}`} />
              {connections.ga4 ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Analytics 4</h3>
            <p className={`text-sm ${connections.ga4 ? 'text-green-600' : 'text-gray-500'}`}>
              {connections.ga4 ? 'Bağlı ve veri çekiyor' : 'Bağlantı kurulmamış'}
            </p>
            {!connections.ga4 && (
              <button
                onClick={() => startAuth('ga4')}
                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
              >
                Bağla
              </button>
            )}
          </div>

          <div className={`p-6 rounded-2xl border-2 ${connections.youtube ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <Youtube className={`w-8 h-8 ${connections.youtube ? 'text-red-600' : 'text-gray-400'}`} />
              {connections.youtube ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">YouTube Analytics</h3>
            <p className={`text-sm ${connections.youtube ? 'text-green-600' : 'text-gray-500'}`}>
              {connections.youtube ? 'Bağlı ve veri çekiyor' : 'Bağlantı kurulmamış'}
            </p>
            {!connections.youtube && (
              <button
                onClick={() => startAuth('youtube')}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Bağla
              </button>
            )}
          </div>

          <div className={`p-6 rounded-2xl border-2 ${connections.instagram ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <Instagram className={`w-8 h-8 ${connections.instagram ? 'text-pink-600' : 'text-gray-400'}`} />
              {connections.instagram ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instagram Business</h3>
            <p className={`text-sm ${connections.instagram ? 'text-green-600' : 'text-gray-500'}`}>
              {connections.instagram ? 'Bağlı ve veri çekiyor' : 'Yakında geliyor'}
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
            value={hasOverviewData ? formatNumber(dashboardData.overview.data.totalSessions) : '--'} 
            change={hasOverviewData ? dashboardData.overview.data.sessionGrowth : null}
            icon={Eye} 
            color="primary"
            hasData={hasOverviewData}
          />
          <MetricCard 
            title="Aktif Kullanıcı" 
            value={hasOverviewData ? formatNumber(dashboardData.overview.data.activeUsers) : '--'} 
            change={hasOverviewData ? dashboardData.overview.data.userGrowth : null}
            icon={Users} 
            color="info"
            hasData={hasOverviewData}
          />
          <MetricCard 
            title="Etkileşim Oranı" 
            value={hasOverviewData ? `${dashboardData.overview.data.engagementRate}%` : '--'} 
            change={hasOverviewData ? dashboardData.overview.data.engagementGrowth : null}
            icon={Heart} 
            color="secondary"
            hasData={hasOverviewData}
          />
          <MetricCard 
            title="Çıkış Oranı" 
            value={hasOverviewData ? `${dashboardData.overview.data.bounceRate}%` : '--'} 
            change={hasOverviewData ? dashboardData.overview.data.bounceGrowth : null}
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
              onAction={() => setActiveTab('reports')}
            />
          </div>
        )}

        {/* Hızlı Veri Çekme */}
        {hasAnyConnection && (
          <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Güncelleme</h3>
                <p className="text-gray-600">Tüm bağlı platformlardan güncel verileri çekin</p>
              </div>
              <button
                onClick={fetchAllData}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg hover:from-purple-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 flex items-center"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Çekiliyor...' : 'Verileri Güncelle'}
              </button>
            </div>
          </div>
        )}

        {/* Son güncelleme bilgisi */}
        {dashboardData.lastUpdated && (
          <div className="text-center text-sm text-gray-500">
            Son güncelleme: {new Date(dashboardData.lastUpdated).toLocaleString('tr-TR')}
          </div>
        )}
      </div>
    );
  };

  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Raporlarım</h2>
        <button
          onClick={fetchAllData}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Yükleniyor...' : 'Veri Çek'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GA4 Reports */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">GA4 Raporları</h3>
          </div>
          {connections.ga4 ? (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Kullanıcı Kaynakları</p>
                <p className="text-sm text-gray-600">Ziyaretçilerin nereden geldiği</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Demografik Analiz</p>
                <p className="text-sm text-gray-600">Yaş ve cinsiyet dağılımı</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Cihaz Analizi</p>
                <p className="text-sm text-gray-600">Mobil, desktop kullanımı</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-3">GA4 bağlantısı gerekli</p>
              <button
                onClick={() => startAuth('ga4')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                GA4 Bağla
              </button>
            </div>
          )}
        </div>

        {/* YouTube Reports */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Youtube className="w-8 h-8 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">YouTube Raporları</h3>
          </div>
          {connections.youtube ? (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Trafik Kaynakları</p>
                <p className="text-sm text-gray-600">YouTube trafiğinin nereden geldiği</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Yaş Grupları</p>
                <p className="text-sm text-gray-600">İzleyici yaş dağılımı</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Cihaz Türleri</p>
                <p className="text-sm text-gray-600">İzlenme cihaz analizi</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-3">YouTube bağlantısı gerekli</p>
              <button
                onClick={() => startAuth('youtube')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                YouTube Bağla
              </button>
            </div>
          )}
        </div>

        {/* Instagram Reports */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Instagram className="w-8 h-8 text-pink-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Instagram Raporları</h3>
          </div>
          <div className="text-center py-6">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">Yakında geliyor</p>
            <button
              disabled
              className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
            >
              Geliştiriliyor
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const DataStatusTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Veri Güncelleme Durumu</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Durumları */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Bağlantı Durumları</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Google Analytics 4</p>
                  <p className="text-sm text-gray-600">Web analytics verisi</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                connections.ga4 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {connections.ga4 ? 'Aktif' : 'Pasif'}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Youtube className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">YouTube Analytics</p>
                  <p className="text-sm text-gray-600">Video performans verisi</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                connections.youtube ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {connections.youtube ? 'Aktif' : 'Pasif'}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Instagram className="w-6 h-6 text-pink-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Instagram Business</p>
                  <p className="text-sm text-gray-600">Sosyal medya verisi</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                Geliştiriliyor
              </div>
            </div>
          </div>
        </div>

        {/* Son Güncellemeler */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Veri Güncellemeleri</h3>
          {dashboardData.lastUpdated ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Dashboard Verileri</span>
                </div>
                <span className="text-xs text-gray-600">
                  {new Date(dashboardData.lastUpdated).toLocaleString('tr-TR')}
                </span>
              </div>
              
              {connections.ga4 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">GA4 Raporları</span>
                  </div>
                  <span className="text-xs text-gray-600">Otomatik güncelleme</span>
                </div>
              )}

              {connections.youtube && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <Youtube className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">YouTube Raporları</span>
                  </div>
                  <span className="text-xs text-gray-600">Otomatik güncelleme</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Henüz veri güncellenmemiş</p>
              <button
                onClick={fetchAllData}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Güncelleniyor...' : 'Şimdi Güncelle'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Ayarlar</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hesap Bilgileri */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input 
                type="text" 
                value={user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''} 
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Tipi</label>
              <input 
                type="text" 
                value={userType === 'company' ? 'Firma' : 'Influencer'} 
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* API Yönetimi */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Bağlantıları</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Google Analytics 4</p>
                  <p className="text-sm text-gray-600">Web analytics</p>
                </div>
              </div>
              <button
                onClick={() => connections.ga4 ? null : startAuth('ga4')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  connections.ga4 
                    ? 'bg-green-100 text-green-700 cursor-default' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {connections.ga4 ? 'Bağlı' : 'Bağla'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Youtube className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">YouTube Analytics</p>
                  <p className="text-sm text-gray-600">Video analytics</p>
                </div>
              </div>
              <button
                onClick={() => connections.youtube ? null : startAuth('youtube')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  connections.youtube 
                    ? 'bg-green-100 text-green-700 cursor-default' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {connections.youtube ? 'Bağlı' : 'Bağla'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Instagram className="w-6 h-6 text-pink-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Instagram Business</p>
                  <p className="text-sm text-gray-600">Sosyal medya analytics</p>
                </div>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed"
              >
                Yakında
              </button>
            </div>
          </div>
        </div>

        {/* Hesap İşlemleri */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap İşlemleri</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left">
              Şifre Değiştir
            </button>
            <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left">
              Veri Dışa Aktar
            </button>
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-left flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Oturumu Kapat
            </button>
          </div>
        </div>

        {/* Bildirim Ayarları */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Ayarları</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Bildirimleri</p>
                <p className="text-sm text-gray-600">Haftalık rapor özetleri</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Veri Güncellemeleri</p>
                <p className="text-sm text-gray-600">Yeni veri geldiğinde bildir</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Sistem Uyarıları</p>
                <p className="text-sm text-gray-600">API hataları ve sistem mesajları</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const InfluencerMatchingTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Influencer Eşleştirme</h2>
      
      <div className="text-center py-12">
        <UserCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Influencer Eşleştirme Sistemi</h3>
        <p className="text-gray-600 mb-6">
          Bu özellik geliştirilme aşamasında. Yakında firmalar ve influencer'lar arasında akıllı eşleştirme yapabileceksiniz.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
          <h4 className="font-semibold text-blue-900 mb-2">Gelecek Özellikler:</h4>
          <ul className="text-sm text-blue-700 text-left space-y-1">
            <li>• Kategori bazlı filtreleme</li>
            <li>• Takipçi sayısına göre arama</li>
            <li>• Etkileşim oranı analizi</li>
            <li>• Uyum puanı hesaplama</li>
            <li>• Karşılaştırma araçları</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const ComparisonTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Karşılaştırma</h2>
      
      <div className="text-center py-12">
        <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Rakip Analizi ve Karşılaştırma</h3>
        <p className="text-gray-600 mb-6">
          Bu bölümde rakiplerinizle karşılaştırma yapabilir ve sektördeki konumunuzu analiz edebileceksiniz.
        </p>
        <div className="bg-orange-50 rounded-lg p-4 max-w-md mx-auto">
          <h4 className="font-semibold text-orange-900 mb-2">Planlanan Özellikler:</h4>
          <ul className="text-sm text-orange-700 text-left space-y-1">
            <li>• Rakip firma analizi</li>
            <li>• Sektör benchmarking</li>
            <li>• Zaman serisi karşılaştırması</li>
            <li>• Trafik analizi</li>
            <li>• Etkileşim karşılaştırması</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'reports':
      case 'ga4':
      case 'youtube':
      case 'instagram':
        return <ReportsTab />;
      case 'influencer-matching':
        return <InfluencerMatchingTab />;
      case 'comparison':
        return <ComparisonTab />;
      case 'data-status':
        return <DataStatusTab />;
      case 'settings':
      case 'profile-settings':
        return <SettingsTab />;
      default:
        return (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bu Sayfa Geliştiriliyor</h2>
            <p className="text-gray-600">
              {activeTab} sayfası yakında tamamlanacak.
            </p>
          </div>
        );
    }
  };

  // Loading state kontrolü
  if (isLoading && !dashboardData.lastUpdated) {
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
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        {/* Message Bar */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border flex items-center justify-between ${
            messageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : messageType === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : messageType === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span>{message}</span>
            <button 
              onClick={() => setMessage('')}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Bar */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-4 text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <main className="flex-1 p-6">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;