import React from 'react';

const plan = {
  name: 'Influencer Pro',
  status: 'Aktif',
  renewDate: '30.07.2025',
  desc: 'Tüm analiz ve entegrasyon özellikleri aktif. Sınırsız rapor ve API erişimi.'
};

const PlanInfoCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-orange-50 min-h-[120px]">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A00] to-pink-500 text-white shadow">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
        </span>
        <div>
          <div className="font-bold text-[#1F1F1F] text-lg">{plan.name}</div>
          <div className="text-xs text-green-600 font-bold">{plan.status}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-1">Yenileme Tarihi: <span className="font-semibold text-[#FF6A00]">{plan.renewDate}</span></div>
      <div className="text-xs text-gray-400">{plan.desc}</div>
    </div>
  );
};

export default PlanInfoCard; 