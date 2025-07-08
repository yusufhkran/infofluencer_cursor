// SettingsPage.js: Infofluencer platformu için ayarlar ana sayfası

/**
 * SettingsPage, kullanıcıya hesap, API bağlantıları, bildirim, güvenlik ve fatura ayarlarını sekmeli olarak sunar.
 * Her sekme ayrı bir alt component içerir. URL'deki ?tab= parametresiyle sekme kontrolü yapılır.
 */
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AccountInfo from '../components/Settings/AccountInfo';
import ApiConnections from '../components/Settings/ApiConnections';
import NotificationPreferences from '../components/Settings/NotificationPreferences';
import SecuritySettings from '../components/Settings/SecuritySettings';
import BillingInfo from '../components/Settings/BillingInfo';

const tabs = [
  { label: 'Hesap Bilgilerim', component: <AccountInfo /> },
  { label: 'API Bağlantıları', component: <ApiConnections /> },
  { label: 'Bildirim Tercihleri', component: <NotificationPreferences /> },
  { label: 'Güvenlik ve Şifre', component: <SecuritySettings /> },
  { label: 'Fatura ve Ödeme', component: <BillingInfo /> },
];

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = parseInt(searchParams.get('tab'), 10);
  const [activeTab, setActiveTab] = useState(Number.isNaN(tabParam) ? 0 : tabParam);

  useEffect(() => {
    if (!Number.isNaN(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
    // eslint-disable-next-line
  }, [tabParam]);

  const handleTabClick = (idx) => {
    setActiveTab(idx);
    setSearchParams({ tab: idx });
  };

  return (
    <div className="settings-page">
      <div className="settings-tabs">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            className={activeTab === idx ? 'active' : ''}
            onClick={() => handleTabClick(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="settings-content">{tabs[activeTab].component}</div>
    </div>
  );
};

export default SettingsPage; 