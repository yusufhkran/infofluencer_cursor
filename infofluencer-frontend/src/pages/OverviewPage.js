// OverviewPage.js: Infofluencer platformunun ana paneli

/**
 * OverviewPage, kullanıcıya girişte gösterilen ana ekrandır.
 * Influencer arama, AI öneriler, rekabet analizi, performans, plan bilgisi, rapor hakkı ve son aktiviteler bloklarını içerir.
 * Sadece içerik panellerini içerir, layout Dashboard.js'de sağlanır.
 */
import React, { useEffect, useState } from 'react';
import InfluencerSearchPanel from '../components/Overview/InfluencerSearchPanel';
import SmartAIInsightsPanel from '../components/Overview/SmartAIInsightsPanel';
import CompetitionCardsPanel from '../components/Overview/CompetitionCardsPanel';
import PerformanceCardsPanel from '../components/Overview/PerformanceCardsPanel';
import PlanInfoPanel from '../components/Overview/PlanInfoPanel';
import ReportQuotaPanel from '../components/Overview/ReportQuotaPanel';
import RecentActivityPanel from '../components/Overview/RecentActivityPanel';
import { checkAndHandleJWTToken } from '../services/authApi';
import { tokenUtils } from '../services/api';

const MEMBERSHIP_PLANS = [
  {
    key: 'free',
    title: 'Free',
    desc: 'Temel analiz, sınırlı rapor ve bağlantı hakkı. Başlangıç için ideal.',
  },
  {
    key: 'basic',
    title: 'Basic',
    desc: 'Daha fazla analiz ve bağlantı, gelişmiş raporlar. Büyüyen ekipler için.',
  },
  {
    key: 'pro',
    title: 'Pro',
    desc: 'AI önerileri, sınırsız analiz, rekabet ve performans panelleri. Tüm özellikler açık.',
  },
];

const OverviewPage = () => {
  const [membership, setMembership] = useState('free');
  const [profileLoading, setProfileLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    checkAndHandleJWTToken();
    async function fetchProfile() {
      setProfileLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/auth/profile/', {
          headers: { Authorization: `Bearer ${tokenUtils.getAccessToken()}` },
        });
        const data = await res.json();
        if (data?.profile?.isPro) setMembership('pro');
        else if (data?.profile?.isBasic) setMembership('basic');
        else setMembership('free');
      } catch (e) {
        setMembership('free');
      }
      setProfileLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSelectPlan = async (planKey) => {
    if (membership === planKey) return;
    setMsg('Güncelleniyor...');
    try {
      const res = await fetch('http://localhost:8000/api/auth/update_membership/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
        },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.success) {
        setMembership(planKey);
        setMsg(data.message);
        setTimeout(() => setMsg(''), 1500);
      } else {
        setMsg('Hata: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (e) {
      setMsg('İşlem sırasında hata oluştu.');
    }
  };

  if (profileLoading) {
    return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-10 bg-gradient-to-br from-orange-50 via-white to-purple-50 min-h-screen">
      {/* Influencer Arama Paneli */}
      <div className="panel influencer-search-panel col-span-3 p-4 pb-4 bg-white/90 rounded-2xl shadow-lg border border-orange-100 mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2 text-center">Influencer Arama</h2>
        <InfluencerSearchPanel />
      </div>
      {/* Üyelik Planları Kartı */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-full max-w-3xl bg-white border-2 border-purple-200 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
          <h2 className="text-2xl font-bold text-purple-700 mb-2 text-center">Üyelik Planları</h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {MEMBERSHIP_PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`flex-1 border rounded-xl p-6 flex flex-col items-center shadow-sm transition-all duration-200 ${membership === plan.key ? 'border-purple-500 bg-purple-50 scale-105' : 'border-gray-200 bg-white hover:shadow-md'}`}
              >
                <div className="text-lg font-bold mb-1">{plan.title}</div>
                <div className="text-gray-600 text-sm mb-3 text-center">{plan.desc}</div>
                <button
                  className={`px-4 py-2 rounded font-semibold mt-auto w-full transition ${membership === plan.key ? 'bg-purple-500 text-white cursor-default' : 'bg-gray-100 text-purple-700 hover:bg-purple-100'}`}
                  disabled={membership === plan.key}
                  onClick={() => handleSelectPlan(plan.key)}
                >
                  {membership === plan.key ? 'Seçili' : 'Seç'}
                </button>
                {membership === plan.key && <div className="mt-2 text-xs text-purple-700 font-semibold">Şu anki üyeliğiniz</div>}
              </div>
            ))}
          </div>
          {msg && <div className="mt-2 p-2 bg-green-100 text-green-700 rounded text-center">{msg}</div>}
        </div>
      </div>
      {/* Diğer paneller */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {/* [B] Smart Insights & AI Panel (Pro) */}
        <div className="panel smart-ai-insights-panel p-8 bg-white/90 rounded-2xl shadow-lg border border-purple-100">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">Smart Insights & AI <span className='text-xs text-yellow-600'>(Pro)</span></h2>
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm flex items-center gap-2">
            Bu panel Pro plan kullanıcılarına özeldir. <button type="button" className="underline font-semibold text-left bg-transparent border-0 p-0 m-0 cursor-pointer">Planınızı yükseltin</button>.
          </div>
          <div className="mb-2 font-semibold text-purple-700">AI Önerisi</div>
          <div className="text-sm mb-4">Sitenizi ziyaret eden kullanıcıların %63’ü 25-34 yaş arası erkek. Bu hedefe uygun creatorlar şunlardır: <span className="font-bold">@influencer1, @influencer2</span></div>
          <div className="mb-2 font-semibold text-purple-700">AI Önerisi</div>
          <div className="text-sm">Son kampanyanızın etkisi azalmış olabilir. <span className="font-bold">@influencer3</span> ile yeni bir kampanya başlatmayı düşünebilirsiniz.</div>
        </div>
        {/* [C] Rekabet Analizi Kartları (Pro) */}
        <div className="panel competition-cards-panel col-span-1 mt-8 p-8 bg-white/90 rounded-2xl shadow-lg border border-blue-100">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">Rekabet Analizi <span className='text-xs text-yellow-600'>(Pro)</span></h2>
          <div className="mb-2 font-semibold text-blue-700">Sektörde Popüler Creator'lar</div>
          <ul className="list-disc ml-6 text-sm mb-4 text-gray-700">
            <li>@populer1 (Kozmetik, 1.2M takipçi)</li>
            <li>@populer2 (Moda, 900K takipçi)</li>
            <li>@populer3 (Teknoloji, 700K takipçi)</li>
          </ul>
          <div className="mb-2 font-semibold text-blue-700">Başarı Hikayeleri</div>
          <div className="text-sm text-gray-600">ABC Kozmetik firması, <span className="font-bold">@populer1</span> ile yaptığı kampanya sonrası satışlarını %35 artırdı.</div>
        </div>
        {/* [D] Hesap Performans Kartları (Pro) */}
        <div className="panel performance-cards-panel col-span-1 mt-8 p-8 bg-white/90 rounded-2xl shadow-lg border border-green-100">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">Hesap Performansı <span className='text-xs text-yellow-600'>(Pro)</span></h2>
          <div className="mb-2 font-semibold text-green-700">GA4 Trafik Değişimi</div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-3 text-center text-xs text-gray-500 mb-2 shadow-inner">[Line Chart Placeholder]</div>
          <div className="mb-2 font-semibold text-green-700">Dönüşüm Oranı: <span className="text-green-600">%2.8</span></div>
          <div className="mb-2 font-semibold text-green-700">YouTube Video Performansı</div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 text-center text-xs text-gray-500 mb-2 shadow-inner">[Bar Chart Placeholder]</div>
          <div className="mb-2 font-semibold text-blue-700">Instagram Gönderi ER: <span className="text-blue-600">%4.2</span></div>
        </div>
        {/* [E] Abonelik Plan Bilgilendirme + CTA */}
        <div className="panel plan-info-panel p-8 bg-white/90 rounded-2xl shadow-lg border border-orange-200 flex flex-col justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">Abonelik Planı</h2>
          <div className="mb-2 text-gray-700">Free Plan kullanıyorsunuz.</div>
          <div className="mb-2 text-gray-700">Kalan hak: <span className="font-bold">1/2</span></div>
          <div className="mb-2 text-gray-700">Tavsiye: <span className="font-semibold">Basic ile 50 influencer analiz hakkı, Pro ile AI önerileri açılır.</span></div>
          <div className="flex gap-2 mt-4">
            <button className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold shadow hover:scale-105 transition">Plan Karşılaştır</button>
            <button className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:scale-105 transition">Yükselt</button>
          </div>
        </div>
        {/* [F] Rapor Hakkı Sayacı */}
        <div className="panel report-quota-panel p-8 bg-white/90 rounded-2xl shadow-lg border border-red-100">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">Rapor Hakkı</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2 shadow-inner">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full flex items-center justify-end pr-2" style={{width: '50%'}}>
              <span className="text-xs text-white font-bold">1/2</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-red-600 font-semibold">Rapor hakkı yalnızca Advanced raporlar için geçerlidir.</span>
          </div>
        </div>
        {/* [G] Recent Panel */}
        <div className="panel recent-activity-panel p-8 bg-white/90 rounded-2xl shadow-lg border border-purple-200 col-span-1 md:col-span-2 lg:col-span-3">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-4">Son Aramalar & Kayıtlı Influencer'lar</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-gradient-to-r from-orange-100 to-purple-100 px-3 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow">@influencerA</span>
            <span className="bg-gradient-to-r from-orange-100 to-purple-100 px-3 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow">@influencerB</span>
            <span className="bg-gradient-to-r from-orange-100 to-purple-100 px-3 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow">@influencerC</span>
          </div>
          <div className="flex gap-2">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:scale-105 transition">Gör</button>
            <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:scale-105 transition">Sil</button>
            <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:scale-105 transition">Ağa Ekle</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage; 