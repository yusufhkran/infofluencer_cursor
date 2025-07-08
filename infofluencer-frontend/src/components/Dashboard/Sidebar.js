import React from "react";
import { X } from "lucide-react";
import { useLocation } from 'react-router-dom';

// Sidebar: Analytics dashboard için ana navigasyon menüsünü içerir.

/**
 * Sidebar componenti, kullanıcıya uygulama içi gezinme imkanı sunar.
 * Alt menüler, bağlantılar ve ayarlar gibi bölümleri içerir.
 */

const Sidebar = ({
  userType,
  sidebarOpen,
  setSidebarOpen,
  onNavigate,
  companyMenuItems,
  influencerMenuItems,
}) => {
  const location = useLocation();
  const menuItems =
    userType === "company" ? companyMenuItems : influencerMenuItems;

  const sidebarMenu = [
    { id: 'overview', label: 'Genel Bakış', icon: null },
    { id: 'influencer-discovery', label: 'Influencer Discovery', icon: null },
    { id: 'network', label: "Network'üm", icon: null },
    { id: 'reports', label: "Raporlarım", icon: null, locked: true },
    { id: 'downloads', label: 'Downloads', icon: null },
    { id: 'plans', label: 'Planlar & Üyelik', icon: null },
  ];

  // Aktif route'u belirle
  const activeId = sidebarMenu.find(item => location.pathname.includes(item.id))?.id;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200 h-20">
        <div className="flex items-center">
          {/* Logo */}
          <div className="w-10 h-10 mr-3 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="InfoFluencer Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = `
                  <div class=\"w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-900 rounded-lg flex items-center justify-center\">
                    <span class=\"text-white font-bold text-lg\">i</span>
                  </div>
                `;
              }}
            />
          </div>
          {/* Brand Text */}
          <h2
            className="text-xl font-bold flex items-center"
            style={{
              fontFamily: "'Torus Pro Bold', Arial, sans-serif",
              lineHeight: "1",
            }}
          >
            <span style={{ color: "rgba(240,95,35,255)" }}>info</span>
            <span style={{ color: "rgba(0,1,102,255)" }}>fluencer</span>
          </h2>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="mt-6 flex flex-col h-[calc(100vh-5rem)]">
        <div className="space-y-2 mt-8 flex-1">
          {sidebarMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(`/dashboard/${item.id}`)}
              className={`w-full flex items-center px-6 py-3 text-left rounded-lg transition-colors text-lg font-medium
                ${activeId === item.id ? "bg-purple-50 text-purple-600 border-r-4 border-purple-600" : "text-gray-700 hover:bg-gray-50"}
                ${item.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={item.locked}
            >
              {/* İkon eklemek isterseniz buraya ekleyebilirsiniz */}
              {item.label}
              {item.locked && <span className="ml-2 text-xs text-gray-400">🔒</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
