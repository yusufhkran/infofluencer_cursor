import React from 'react';

const AudienceKPI = ({ label, value, sublabel, color = '#FF6A00' }) => (
  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 rounded-2xl shadow-lg p-6 min-w-[160px] min-h-[120px] border border-orange-100 hover:shadow-xl transition-all duration-300">
    <div className="text-3xl font-extrabold" style={{ color }}>{value}</div>
    <div className="text-sm font-semibold text-gray-700 mt-1 text-center">{label}</div>
    {sublabel && <div className="text-xs text-gray-400 mt-1 text-center">{sublabel}</div>}
  </div>
);

export default AudienceKPI; 