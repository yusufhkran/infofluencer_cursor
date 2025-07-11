import React, { useEffect, useState } from 'react';
import { startGA4Auth, disconnectGA4, getGA4ConnectionStatus, getGA4PropertyId, saveGA4PropertyId, startYouTubeAuth, disconnectYouTube, getYouTubeConnectionStatus, startInstagramAuth, disconnectInstagram, getInstagramConnectionStatus, getInstagramPagesAndAccounts, saveSelectedInstagramAccount, getInstagramAccountDetails } from '../../services/analyticsApi';
import { useLocation, useNavigate } from 'react-router-dom';
import { tokenUtils } from '../../services/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ConnectionsTab = () => {
  const [ga4Connected, setGA4Connected] = useState(false);
  const [ga4PropertyId, setGA4PropertyId] = useState('');
  const [ga4PropertyIdInput, setGA4PropertyIdInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [youtubeConnected, setYouTubeConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [showInstagramSelect, setShowInstagramSelect] = useState(false);
  const [instagramPages, setInstagramPages] = useState([]);
  const [instagramSelectLoading, setInstagramSelectLoading] = useState(false);
  const [selectedInstagram, setSelectedInstagram] = useState(null);
  const [instagramSelectError, setInstagramSelectError] = useState('');
  const [instagramAccountDetails, setInstagramAccountDetails] = useState(null);
  const query = useQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPro, setIsPro] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Sade dummy data
  const ga4Summary = '13K ziyaret, %4 dönüşüm';
  const ga4AiScore = 88;
  const youtubeSummary = '25K izlenme, 1.2K beğeni';
  const youtubeAiScore = 85;
  const instagramSummary = 'Son 30 gün: 3.2K etkileşim';
  const instagramAiScore = 72;

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      const conn = await getGA4ConnectionStatus();
      setGA4Connected(conn.connected);
      if (conn.connected) {
        const prop = await getGA4PropertyId();
        if (prop.success && prop.property_id) {
          setGA4PropertyId(prop.property_id);
          setGA4PropertyIdInput(prop.property_id);
        } else {
          setGA4PropertyId('');
          setGA4PropertyIdInput('');
        }
      } else {
        setGA4PropertyId('');
        setGA4PropertyIdInput('');
      }
      const ytConn = await getYouTubeConnectionStatus();
      setYouTubeConnected(ytConn.connected);
      const instaConn = await getInstagramConnectionStatus();
      setInstagramConnected(instaConn.connected);
      if (instaConn.connected) {
        const details = await getInstagramAccountDetails();
        if (details.success) {
          setInstagramAccountDetails(details);
        } else {
          setInstagramAccountDetails(null);
        }
      } else {
        setInstagramAccountDetails(null);
      }
      setLoading(false);
    }
    fetchStatus();
    if (query.get('youtube_connected') === '1') {
      setSuccessMsg('YouTube başarıyla bağlandı!');
      setTimeout(() => setSuccessMsg(''), 2000);
      navigate('/dashboard', { replace: true });
    }
    if (query.get('instagram_connected') === '1') {
      setSuccessMsg('Instagram başarıyla bağlandı!');
      setTimeout(() => setSuccessMsg(''), 2000);
      navigate('/dashboard', { replace: true });
    }
    const params = new URLSearchParams(location.search);
    if (params.get('success') === '1') {
      setSuccessMsg('Instagram hesabı başarıyla bağlandı!');
      setTimeout(() => setSuccessMsg(''), 10000);
      // URL'den parametreyi kaldır
      const newUrl = location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [window.location.search, location.search]);

  useEffect(() => {
    async function fetchProfile() {
      setProfileLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/auth/profile/', {
          headers: { Authorization: `Bearer ${tokenUtils.getAccessToken()}` },
        });
        const data = await res.json();
        setIsPro(data?.profile?.isPro || false);
      } catch (e) {
        setIsPro(false);
      }
      setProfileLoading(false);
    }
    fetchProfile();
  }, []);

  if (profileLoading) {
    return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;
  }
  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-2 font-sans">
        <div className="bg-white border-2 border-[#F97316]/20 rounded-2xl p-6 flex flex-col gap-4 shadow-md mb-8">
          <h2 className="text-xl font-bold text-[#F97316] mb-2">Pro Özelliklere Erişim İçin Yükselt!</h2>
          <p className="text-gray-700 mb-2">Bağlantılarım sayfası sadece Pro kullanıcılar için aktiftir. Pro'ya geçerek tüm bağlantılarını yönetebilir, gerçek verilerini görebilirsin.</p>
          <button className="bg-[#F97316] text-white px-4 py-2 rounded font-semibold text-lg hover:bg-[#ea6600] transition">Pro Ol</button>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2 text-[#8B5CF6]">Örnek Bağlantılar</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-[#F97316] rounded-full"></span> Google Analytics 4 (Demo)</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-[#8B5CF6] rounded-full"></span> YouTube API (Demo)</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-[#10B981] rounded-full"></span> Instagram Graph API (Demo)</li>
          </ul>
        </div>
      </div>
    );
  }

  const handleGA4Connect = async () => {
    setLoading(true);
    const res = await startGA4Auth();
    if (res && res.success && res.auth_url) {
      window.location.href = res.auth_url;
    } else {
      alert('GA4 bağlantısı başlatılamadı.');
    }
    setLoading(false);
  };

  const handleGA4Disconnect = async () => {
    setLoading(true);
    const res = await disconnectGA4();
    if (res && res.success) {
      setGA4Connected(false);
      setGA4PropertyId('');
      setGA4PropertyIdInput('');
      setSuccessMsg('GA4 bağlantısı başarıyla kapatıldı.');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
    setLoading(false);
  };

  const handleSavePropertyId = async () => {
    setLoading(true);
    const res = await saveGA4PropertyId(ga4PropertyIdInput);
    if (res && res.success) {
      setGA4PropertyId(ga4PropertyIdInput);
      setSuccessMsg('GA4 Property ID kaydedildi!');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
    setLoading(false);
  };

  const handleYouTubeConnect = async () => {
    setLoading(true);
    const res = await startYouTubeAuth();
    if (res && res.success && res.auth_url) {
      window.location.href = res.auth_url;
    } else {
      alert('YouTube bağlantısı başlatılamadı.');
    }
    setLoading(false);
  };

  const handleYouTubeDisconnect = async () => {
    setLoading(true);
    const res = await disconnectYouTube();
    if (res && res.success) {
      setYouTubeConnected(false);
      setSuccessMsg('YouTube bağlantısı başarıyla kapatıldı.');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
    setLoading(false);
  };

  const handleInstagramConnect = async () => {
    setLoading(true);
    const res = await startInstagramAuth();
    if (res && res.auth_url) {
      window.location.href = res.auth_url;
    } else {
      alert('Instagram bağlantısı başlatılamadı.');
    }
    setLoading(false);
  };

  const handleInstagramDisconnect = async () => {
    setLoading(true);
    const res = await disconnectInstagram();
    if (res && res.success) {
      setInstagramConnected(false);
      setSuccessMsg('Instagram bağlantısı başarıyla kapatıldı.');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
    setLoading(false);
  };

  const handleInstagramSelectAndSave = async () => {
    if (!selectedInstagram) return;
    const selectedPage = instagramPages.find(page => page.instagram_account && page.instagram_account.id === selectedInstagram);
    if (!selectedPage) return;
    setInstagramSelectLoading(true);
    const res = await saveSelectedInstagramAccount({
      page_id: selectedPage.page_id,
      instagram_account_id: selectedInstagram
    });
    setInstagramSelectLoading(false);
    if (res.success) {
      setShowInstagramSelect(false);
      setInstagramConnected(true);
      setSuccessMsg('Instagram hesabı başarıyla bağlandı!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } else {
      setInstagramSelectError(res.error || 'Instagram hesabı kaydedilemedi.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-2 font-sans">
      <h2 className="text-2xl font-bold mb-8 text-[#F97316]">API Bağlantılarım</h2>
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-center text-sm font-medium border border-green-100">
          {successMsg}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* GA4 */}
        <div className="bg-white border-2 border-[#F97316]/20 rounded-2xl p-6 flex flex-col gap-4 min-h-[240px] shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-[#8B5CF6]">Google Analytics 4</span>
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${ga4Connected ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>{ga4Connected ? 'Bağlı' : 'Bağlı değil'}</span>
          </div>
          <div className="text-xs text-gray-500 mb-2">Web sitesi trafiği ve dönüşüm verileri</div>
          <div className="text-sm text-gray-700 mb-1"><b>Özet:</b> {ga4Summary}</div>
          <div className="flex items-center gap-2">
            <div className="w-full bg-[#8B5CF6]/10 rounded h-2">
              <div className="bg-gradient-to-r from-[#F97316] to-[#8B5CF6] h-2 rounded" style={{ width: `${ga4AiScore}%` }}></div>
            </div>
            <span className="text-xs font-semibold text-[#8B5CF6]">AI Skor: %{ga4AiScore}</span>
          </div>
          {ga4Connected && (
            <div className="mt-2">
              <input
                type="text"
                className="w-full border border-[#8B5CF6]/30 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#8B5CF6]/40"
                value={ga4PropertyIdInput}
                onChange={e => setGA4PropertyIdInput(e.target.value)}
                disabled={loading}
                placeholder="GA4 Property ID"
              />
              <button
                onClick={handleSavePropertyId}
                disabled={loading || !ga4PropertyIdInput}
                className="mt-2 w-full px-3 py-1 bg-[#8B5CF6] text-white rounded text-sm font-medium hover:bg-[#7C3AED] transition-colors"
              >
                {ga4PropertyId ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          )}
          <div className="flex gap-2 mt-auto">
            {ga4Connected ? (
              <button onClick={handleGA4Disconnect} disabled={loading} className="flex-1 bg-[#F97316]/10 text-[#F97316] px-3 py-1 rounded text-sm font-medium border border-[#F97316]/30 hover:bg-[#F97316]/20 transition-colors">Bağlantıyı Kapat</button>
            ) : (
              <button onClick={handleGA4Connect} disabled={loading} className="flex-1 bg-[#F97316] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#ed5f27] transition-colors">Bağlan</button>
            )}
          </div>
        </div>
        {/* YouTube */}
        <div className="bg-white border-2 border-[#8B5CF6]/20 rounded-2xl p-6 flex flex-col gap-4 min-h-[240px] shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-[#F97316]">YouTube API</span>
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${youtubeConnected ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>{youtubeConnected ? 'Bağlı' : 'Bağlı değil'}</span>
          </div>
          <div className="text-xs text-gray-500 mb-2">Kanal ve video analizleri</div>
          <div className="text-sm text-gray-700 mb-1"><b>Özet:</b> {youtubeSummary}</div>
          <div className="flex items-center gap-2">
            <div className="w-full bg-[#F97316]/10 rounded h-2">
              <div className="bg-gradient-to-r from-[#8B5CF6] to-[#F97316] h-2 rounded" style={{ width: `${youtubeAiScore}%` }}></div>
            </div>
            <span className="text-xs font-semibold text-[#F97316]">AI Skor: %{youtubeAiScore}</span>
          </div>
          <div className="flex gap-2 mt-auto">
            {youtubeConnected ? (
              <button onClick={handleYouTubeDisconnect} disabled={loading} className="flex-1 bg-[#8B5CF6]/10 text-[#8B5CF6] px-3 py-1 rounded text-sm font-medium border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20 transition-colors">Bağlantıyı Kapat</button>
            ) : (
              <button onClick={handleYouTubeConnect} disabled={loading} className="flex-1 bg-[#8B5CF6] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#7C3AED] transition-colors">Bağlan</button>
            )}
          </div>
        </div>
        {/* Instagram Graph API */}
        <div className="bg-white border-2 border-[#F97316]/20 rounded-2xl p-6 flex flex-col gap-4 min-h-[240px] shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-[#8B5CF6]">Instagram Graph API</span>
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${instagramConnected ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>{instagramConnected ? 'Bağlı' : 'Bağlı değil'}</span>
          </div>
          <div className="text-xs text-gray-500 mb-2">Instagram işletme hesabı analizleri</div>
          {instagramConnected && instagramAccountDetails && (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-2 mb-2">
              {instagramAccountDetails.profile_picture_url && (
                <img src={instagramAccountDetails.profile_picture_url} alt="Profil" className="w-10 h-10 rounded-full border" />
              )}
              <div>
                <div className="font-semibold text-[#8B5CF6]">{instagramAccountDetails.name || 'Ad yok'}</div>
                <div className="text-xs text-gray-500">@{instagramAccountDetails.username}</div>
              </div>
            </div>
          )}
          <div className="text-sm text-gray-700 mb-1"><b>Özet:</b> {instagramSummary}</div>
          <div className="flex items-center gap-2">
            <div className="w-full bg-[#8B5CF6]/10 rounded h-2">
              <div className="bg-gradient-to-r from-[#F97316] to-[#8B5CF6] h-2 rounded" style={{ width: `${instagramAiScore}%` }}></div>
            </div>
            <span className="text-xs font-semibold text-[#8B5CF6]">AI Skor: %{instagramAiScore}</span>
          </div>
          <div className="flex gap-2 mt-auto">
            {instagramConnected ? (
              <button onClick={handleInstagramDisconnect} disabled={loading} className="flex-1 bg-[#8B5CF6]/10 text-[#8B5CF6] px-3 py-1 rounded text-sm font-medium border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20 transition-colors">Bağlantıyı Kapat</button>
            ) : (
              <button onClick={handleInstagramConnect} disabled={loading} className="flex-1 bg-[#8B5CF6] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#7C3AED] transition-colors">Bağlan</button>
            )}
          </div>
          {/* Instagram hesap seçimi modalı */}
          {showInstagramSelect && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h3 className="text-lg font-bold mb-4 text-[#8B5CF6]">Instagram Hesabı Seç</h3>
                {instagramSelectLoading ? (
                  <div>Yükleniyor...</div>
                ) : instagramSelectError ? (
                  <div className="text-red-500">{instagramSelectError}</div>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {instagramPages.map((page) => (
                      <li key={page.page_id} className="border rounded p-2 flex flex-col">
                        <span className="font-semibold">{page.page_name}</span>
                        {page.instagram_account ? (
                          <button
                            className={`mt-1 px-2 py-1 rounded bg-[#8B5CF6] text-white text-xs font-medium ${selectedInstagram === page.instagram_account.id ? 'ring-2 ring-[#F97316]' : ''}`}
                            onClick={() => setSelectedInstagram(page.instagram_account.id)}
                          >
                            {page.instagram_account.id}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Bağlı Instagram hesabı yok</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowInstagramSelect(false)} className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded">İptal</button>
                  <button
                    onClick={handleInstagramSelectAndSave}
                    disabled={!selectedInstagram || instagramSelectLoading}
                    className="flex-1 bg-[#F97316] text-white px-3 py-1 rounded font-medium disabled:opacity-50"
                  >
                    Seç ve Bağla
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsTab; 