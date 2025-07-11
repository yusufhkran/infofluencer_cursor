import React from 'react';

const metrics = [
  {
    name: 'Takipçi',
    value: '128K',
    icon: (
      <svg className="w-7 h-7 text-[#FF6A00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-7a4 4 0 11-8 0 4 4 0 018 0zm6 4a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ),
    desc: 'Toplam takipçi sayısı',
  },
  {
    name: 'ER (Etkileşim)',
    value: '4.2%',
    icon: (
      <svg className="w-7 h-7 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
    ),
    desc: 'Etkileşim oranı',
  },
  {
    name: 'Story View Rate',
    value: '38%',
    icon: (
      <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    ),
    desc: 'Hikaye izlenme oranı',
  },
  {
    name: 'Audience Bölgesi',
    value: 'TR, DE, UK',
    icon: (
      <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    ),
    desc: 'En çok takipçi gelen ülkeler',
  },
];

const AnalyticsCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((m) => (
        <div key={m.name} className="flex items-center gap-4 bg-gradient-to-br from-orange-50 via-white to-pink-50 rounded-2xl shadow p-5 hover:scale-[1.03] hover:shadow-lg transition-transform cursor-pointer border border-orange-100">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF6A00]/90 to-pink-500/80 shadow text-white">
            {m.icon}
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold text-[#1F1F1F]">{m.value}</div>
            <div className="text-sm text-gray-500 font-semibold">{m.name}</div>
            <div className="text-xs text-gray-400">{m.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsCards; 