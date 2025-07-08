// OverviewPage.js: Infofluencer platformunun ana paneli

/**
 * OverviewPage, kullanıcıya girişte gösterilen ana ekrandır.
 * Influencer arama, AI öneriler, rekabet analizi, performans, plan bilgisi, rapor hakkı ve son aktiviteler bloklarını içerir.
 * Sadece içerik panellerini içerir, layout Dashboard.js'de sağlanır.
 */
import React from 'react';
import InfluencerSearchPanel from '../components/Overview/InfluencerSearchPanel';
import SmartAIInsightsPanel from '../components/Overview/SmartAIInsightsPanel';
import CompetitionCardsPanel from '../components/Overview/CompetitionCardsPanel';
import PerformanceCardsPanel from '../components/Overview/PerformanceCardsPanel';
import PlanInfoPanel from '../components/Overview/PlanInfoPanel';
import ReportQuotaPanel from '../components/Overview/ReportQuotaPanel';
import RecentActivityPanel from '../components/Overview/RecentActivityPanel';

const OverviewPage = () => (
  <div className="max-w-6xl mx-auto px-4 py-8">
    {/* Infofluencer başlık ve kullanıcı adı */}
    <div className="flex items-center mb-8">
      <img src="/logo.png" alt="Infofluencer Logo" className="w-12 h-12 mr-4" />
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Infofluencer</h1>
        <div className="text-lg text-gray-500">Kullanıcı Adı</div>
      </div>
    </div>
    {/* Overview Panelleri */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* [A] Influencer Search Panel */}
      <div className="panel influencer-search-panel col-span-1 md:col-span-2 lg:col-span-2 row-span-1 p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">Influencer Arama</h2>
        <InfluencerSearchPanel />
      </div>
      {/* [B] Smart Insights & AI Panel (Pro) */}
      <div className="panel smart-ai-insights-panel p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">Smart Insights & AI</h2>
        <SmartAIInsightsPanel />
      </div>
      {/* [C] Rekabet Analizi Kartları */}
      <div className="panel competition-cards-panel p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">Rekabet Analizi</h2>
        <CompetitionCardsPanel />
      </div>
      {/* [D] Hesap Performans Kartları */}
      <div className="panel performance-cards-panel p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">Hesap Performansı</h2>
        <PerformanceCardsPanel />
      </div>
      {/* [E] Abonelik Plan Bilgilendirme + CTA */}
      <div className="panel plan-info-panel p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">Abonelik Planı</h2>
        <PlanInfoPanel />
      </div>
      {/* [F] Rapor Hakkı Sayacı */}
      <div className="panel report-quota-panel p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">Rapor Hakkı</h2>
        <ReportQuotaPanel />
      </div>
      {/* [G] Recent Searches + Saved Influencers */}
      <div className="panel recent-activity-panel p-6 bg-white rounded-xl shadow col-span-1 md:col-span-2 lg:col-span-3">
        <h2 className="text-xl font-bold mb-2">Son Aramalar & Kayıtlı Influencer'lar</h2>
        <RecentActivityPanel />
      </div>
    </div>
  </div>
);

export default OverviewPage; 