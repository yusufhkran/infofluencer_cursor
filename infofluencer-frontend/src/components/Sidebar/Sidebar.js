// Sidebar.js: Infofluencer platformu için sol navigasyon menüsü

/**
 * Sidebar componenti, kullanıcıya uygulama içi gezinme imkanı sunar.
 * Overview, Influencer Discovery, Network'üm, Raporlarım, Downloads, Planlar & Üyelik, Ayarlar (alt menülerle) içerir.
 * Mobilde collapsible, hover'da ikon+metin gösterimi ve kilitli (Pro) menü desteği vardır.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { label: 'Overview', icon: '🏠', route: '/overview' },
  { label: 'Influencer Discovery', icon: '🔍', route: '/discovery' },
  { label: "Network'üm", icon: '👥', route: '/network' },
  { label: 'Raporlarım', icon: '📊', locked: true, route: '/reports' },
  { label: 'Downloads', icon: '⬇️', route: '/downloads' },
  { label: 'Planlar & Üyelik', icon: '💳', route: '/plans' },
];

const settingsSubMenu = [
  { label: 'Hesap Bilgilerim', icon: '👤', tab: 0 },
  { label: 'API Bağlantıları', icon: '🔗', tab: 1 },
  { label: 'Bildirim Tercihleri', icon: '🔔', tab: 2 },
  { label: 'Güvenlik ve Şifre', icon: '🔒', tab: 3 },
  { label: 'Fatura ve Ödeme', icon: '💳', tab: 4 },
];

const Sidebar = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (route, locked) => {
    if (!locked && route) navigate(route);
  };

  const handleSettingsSubMenuClick = (tabIdx) => {
    navigate(`/settings?tab=${tabIdx}`);
  };

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.label}
              className={item.locked ? 'locked' : ''}
              onClick={() => handleMenuClick(item.route, item.locked)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
              {item.locked && <span className="lock">🔒</span>}
            </li>
          ))}
          <li
            className="settings-menu"
            onMouseEnter={() => setSettingsOpen(true)}
            onMouseLeave={() => setSettingsOpen(false)}
          >
            <span className="icon">⚙️</span>
            <span className="label">Ayarlar</span>
            <span className="arrow">▸</span>
            {settingsOpen && (
              <ul className="settings-submenu">
                {settingsSubMenu.map((sub, idx) => (
                  <li
                    key={sub.label}
                    className="submenu-item"
                    onClick={() => handleSettingsSubMenuClick(sub.tab)}
                  >
                    <span className="icon">{sub.icon}</span>
                    <span className="label">{sub.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 