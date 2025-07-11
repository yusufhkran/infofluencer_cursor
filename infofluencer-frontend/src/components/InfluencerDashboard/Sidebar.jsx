import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" /></svg>
  ), path: '/influencer/dashboard' },
  { name: 'Analizler', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 19V6M6 19v-4M16 19v-2M21 19V9" /></svg>
  ), path: '/influencer/dashboard/analytics' },
  { name: 'Entegrasyonlar', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 7h10M7 12h10M7 17h10" /></svg>
  ), path: '/influencer/dashboard/integrations' },
  { name: 'Ayarlar', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.94-2.06a1 1 0 0 0 .26-1.09l-1.43-4.14a1 1 0 0 0-.76-.65l-4.14-1.43a1 1 0 0 0-1.09.26l-2.83 2.83a1 1 0 0 0-.26 1.09l1.43 4.14a1 1 0 0 0 .76.65l4.14 1.43a1 1 0 0 0 1.09-.26l2.83-2.83z" /></svg>
  ), path: '/influencer/dashboard/settings' },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-20 xl:w-64 bg-[#1F1F1F] text-white py-8 px-2 xl:px-6 shadow-2xl min-h-screen">
      {/* Logo */}
      <div className="flex items-center justify-center xl:justify-start mb-12">
        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-lg shadow-lg mr-0 xl:mr-3" />
        <span className="hidden xl:block text-2xl font-extrabold text-[#FF6A00] tracking-tight">Influencer</span>
      </div>
      {/* Nav */}
      <nav className="flex-1 flex flex-col space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition hover:bg-[#FF6A00]/20 hover:text-[#FF6A00] ${isActive ? 'bg-[#FF6A00]/90 text-white shadow-lg' : 'text-white/80'}`
            }
            end
          >
            <span className="w-7 h-7 flex items-center justify-center">{item.icon}</span>
            <span className="hidden xl:inline-block">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      {/* User & Logout */}
      <div className="mt-auto flex flex-col items-center xl:items-start gap-4">
        <div className="flex items-center gap-3">
          <img src="/avatar.png" alt="User" className="w-10 h-10 rounded-full border-2 border-[#FF6A00] shadow" />
          <div className="hidden xl:block">
            <div className="font-bold">@username</div>
            <div className="text-xs text-white/60">Influencer</div>
          </div>
        </div>
        <button className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF6A00] text-white font-bold hover:bg-[#FF6A00]/80 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
          <span className="hidden xl:inline-block">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 