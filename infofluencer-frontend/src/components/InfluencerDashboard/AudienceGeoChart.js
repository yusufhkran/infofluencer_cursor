import React, { useState } from 'react';

const getColor = (i) => [
  'bg-orange-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-pink-400',
  'bg-purple-400',
  'bg-yellow-400',
][i % 6];

const AudienceGeoChart = ({ data, title }) => {
  // Sadece en çok trafik alan ilk 3 lokasyon
  const [showAll, setShowAll] = useState(false);
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const displayData = showAll ? sorted : sorted.slice(0, 3);
  const max = Math.max(...displayData.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
      <div className="text-lg font-bold text-[#FF6A00] mb-3">{title}</div>
      <div className="flex flex-col gap-2">
        {displayData.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-20 text-xs text-gray-600 truncate">{item.label}</span>
            <div className="flex-1 h-4 rounded bg-gray-100 relative">
              <div
                className={`h-4 rounded ${getColor(i)}`}
                style={{ width: `${(item.value / max) * 100}%`, minWidth: 8 }}
              ></div>
            </div>
            <span className="w-10 text-xs font-bold text-gray-700 text-right">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
      {data.length > 3 && (
        <button
          className="mt-2 text-xs text-blue-500 hover:underline"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? 'Daha az göster' : 'Daha fazla göster'}
        </button>
      )}
    </div>
  );
};

export default AudienceGeoChart; 