import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('influencer_token');
    localStorage.removeItem('ig_token');
    // Diğer ilgili tokenlar varsa onları da sil
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    navigate('/influencer/login');
  };

  return (
    <header className="w-full flex items-center justify-between bg-white shadow-sm px-4 md:px-8 py-3 sticky top-0 z-30 rounded-tl-3xl">
      {/* Sol: Boş veya logo */}
      <div className="flex items-center gap-2">
        {/* İleride logo veya arama eklenebilir */}
      </div>
      {/* Sağ: Kullanıcı ve menü */}
      <div className="flex items-center gap-4">
        {/* Bildirim zili */}
        <button className="relative p-2 rounded-full hover:bg-orange-50 transition">
          <svg className="w-6 h-6 text-[#FF6A00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
        </button>
        {/* Kullanıcı avatarı ve isim */}
        <div className="flex items-center gap-2">
          <img src="/avatar.png" alt="User" className="w-9 h-9 rounded-full border-2 border-[#FF6A00] shadow" />
          <div className="hidden md:block text-right">
            <div className="font-bold text-[#1F1F1F]">@username</div>
            <div className="text-xs text-gray-400">Influencer</div>
          </div>
        </div>
        {/* Logout */}
        <button
          className="ml-2 px-3 py-2 rounded-xl bg-[#FF6A00] text-white font-bold hover:bg-[#FF6A00]/80 transition flex items-center gap-2"
          onClick={handleLogout}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
          <span className="hidden md:inline-block">Çıkış</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar; 