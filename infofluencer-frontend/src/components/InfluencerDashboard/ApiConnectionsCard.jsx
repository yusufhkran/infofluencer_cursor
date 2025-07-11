import React, { useState, useEffect } from 'react';
import { getInstagramAuthUrl } from '../../services/instagramApi';

const ApiConnectionsCard = ({ onInstagramConnected }) => {
  const [igToken, setIgToken] = useState(() => localStorage.getItem('ig_token'));
  const [connected, setConnected] = useState(!!igToken);

  // URL'den token geldiyse kaydet
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('ig_token');
    if (token) {
      localStorage.setItem('ig_token', token);
      setIgToken(token);
      setConnected(true);
      if (onInstagramConnected) onInstagramConnected(token);
      // URL'den token'ı temizle
      params.delete('ig_token');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onInstagramConnected]);

  // Eğer localStorage'da token varsa parent'a bildir
  useEffect(() => {
    if (igToken && onInstagramConnected) onInstagramConnected(igToken);
  }, [igToken, onInstagramConnected]);

  const handleConnect = async () => {
    try {
      const url = await getInstagramAuthUrl();
      window.location.href = url;
    } catch (e) {
      alert('Instagram bağlantı başlatılamadı.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-orange-50 min-h-[220px] hover:shadow-xl transition-all duration-300">
      <h3 className="text-lg font-bold text-[#FF6A00] mb-2 flex items-center gap-2">
        <span>🔗 API Entegrasyonları</span>
        <span className="ml-1 text-xs text-gray-400 font-normal">(OAuth 2.0)</span>
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 group hover:bg-orange-50 p-2 rounded-lg transition-colors duration-200">
          {/* Instagram */}
          <span>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="7" fill="url(#ig)"/><defs><linearGradient id="ig" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#F58529"/><stop offset="0.5" stopColor="#DD2A7B"/><stop offset="1" stopColor="#515BD4"/></linearGradient></defs><circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="2"/><circle cx="18" cy="6" r="1" fill="#fff"/></svg>
          </span>
          <span className="font-semibold text-[#1F1F1F] w-24">Instagram</span>
          {connected ? (
            <span className="text-green-500 font-bold flex items-center gap-1">✅ Bağlandı</span>
          ) : (
            <button
              className="ml-auto px-4 py-2 rounded-lg bg-[#FF6A00] text-white font-semibold text-sm hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={handleConnect}
            >Bağlan</button>
          )}
        </div>
        {/* Diğer platformlar mock olarak bırakıldı */}
        <div className="flex items-center gap-3 group hover:bg-red-50 p-2 rounded-lg transition-colors duration-200">
          <span><svg className="w-7 h-7" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="7" fill="#FF0000"/><polygon points="10,8 16,12 10,16" fill="#fff"/></svg></span>
          <span className="font-semibold text-[#1F1F1F] w-24">YouTube</span>
          <button className="ml-auto px-4 py-2 rounded-lg bg-[#FF6A00] text-white font-semibold text-sm hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg">Bağlan</button>
        </div>
        <div className="flex items-center gap-3 group hover:bg-black/5 p-2 rounded-lg transition-colors duration-200">
          <span><svg className="w-7 h-7" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="7" fill="#000"/><path d="M16 8.5c-1.1 0-2-.9-2-2V5h-2v8.5a1.5 1.5 0 11-1.5-1.5" stroke="#fff" strokeWidth="2"/><circle cx="9.5" cy="15.5" r="1.5" fill="#25F4EE"/></svg></span>
          <span className="font-semibold text-[#1F1F1F] w-24">TikTok</span>
          <button className="ml-auto px-4 py-2 rounded-lg bg-[#FF6A00] text-white font-semibold text-sm hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg">Bağlan</button>
        </div>
        <div className="flex items-center gap-3 group hover:bg-purple-50 p-2 rounded-lg transition-colors duration-200">
          <span><svg className="w-7 h-7" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="7" fill="#9147FF"/><path d="M7 17v-9h10v9h-3l-2 2-2-2H7z" stroke="#fff" strokeWidth="2"/></svg></span>
          <span className="font-semibold text-[#1F1F1F] w-24">Twitch</span>
          <span className="text-green-500 font-bold flex items-center gap-1">✅ Bağlandı</span>
        </div>
        <div className="flex items-center gap-3 group hover:bg-green-50 p-2 rounded-lg transition-colors duration-200">
          <span><svg className="w-7 h-7" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="7" fill="#53FC18"/><path d="M8 8h8v8H8z" stroke="#000" strokeWidth="2"/></svg></span>
          <span className="font-semibold text-[#1F1F1F] w-24">Kick</span>
          <button className="ml-auto px-4 py-2 rounded-lg bg-[#FF6A00] text-white font-semibold text-sm hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg">Bağlan</button>
        </div>
      </div>
    </div>
  );
};

export default ApiConnectionsCard; 