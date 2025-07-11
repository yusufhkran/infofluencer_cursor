import React from 'react';

const companies = [
  {
    name: 'Brandify',
    logo: '/company1.png',
    sector: 'Kozmetik',
    viewedAt: '2 saat önce',
  },
  {
    name: 'TechGuru',
    logo: '/company2.png',
    sector: 'Teknoloji',
    viewedAt: 'Dün',
  },
  {
    name: 'FitLife',
    logo: '/company3.png',
    sector: 'Spor & Sağlık',
    viewedAt: '3 gün önce',
  },
];

const CompanyViewsCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-orange-50 min-h-[220px]">
      <h3 className="text-lg font-bold text-[#FF6A00] mb-1 flex items-center gap-2">
        <span>Firmalar Seni İnceliyor</span>
        <span className="ml-1 text-xs text-gray-400 font-normal">(Gizli değil, değerli!)</span>
      </h3>
      <p className="text-xs text-gray-500 mb-2">Aşağıdaki firmalar son dönemde profilini görüntüledi:</p>
      <div className="flex flex-col gap-3">
        {companies.map((c) => (
          <div key={c.name} className="flex items-center gap-3 group hover:bg-orange-50 rounded-xl px-2 py-2 transition">
            <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-lg border border-gray-100 shadow-sm bg-white object-contain" />
            <div className="flex-1">
              <div className="font-bold text-[#1F1F1F]">{c.name}</div>
              <div className="text-xs text-gray-400">{c.sector}</div>
            </div>
            <div className="text-xs text-gray-500 font-semibold mr-2">{c.viewedAt}</div>
            <button className="px-2 py-1 rounded-lg bg-[#FF6A00]/90 text-white text-xs font-bold hover:bg-[#FF6A00] transition">İncele</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyViewsCard; 