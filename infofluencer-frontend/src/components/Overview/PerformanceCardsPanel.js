// PerformanceCardsPanel.js
import React from 'react';

const PerformanceCardsPanel = () => {
  return (
    <div className="space-y-4">
      {/* GA4: Trafik değişimi, dönüşüm oranı */}
      <div className="p-4 bg-gray-50 rounded-lg shadow border">
        <div className="font-bold mb-1">GA4 Trafik Değişimi</div>
        <div className="h-24 flex items-center justify-center text-gray-400">[Line Chart Placeholder]</div>
        <div className="text-xs text-gray-500 mt-2">Dönüşüm Oranı: %2.8</div>
      </div>
      {/* YT: Video başına izlenme ve izlenme süresi */}
      <div className="p-4 bg-gray-50 rounded-lg shadow border">
        <div className="font-bold mb-1">YouTube Video Performansı</div>
        <div className="h-24 flex items-center justify-center text-gray-400">[Bar Chart Placeholder]</div>
        <div className="text-xs text-gray-500 mt-2">Ortalama İzlenme: 12.300 | Ortalama Süre: 3:45 dk</div>
      </div>
      {/* IG: Gönderi ER, story oranı */}
      <div className="p-4 bg-gray-50 rounded-lg shadow border">
        <div className="font-bold mb-1">Instagram Etkileşim Oranları</div>
        <div className="h-24 flex items-center justify-center text-gray-400">[Pie Chart Placeholder]</div>
        <div className="text-xs text-gray-500 mt-2">Gönderi ER: %4.2 | Story Görüntüleme: %38</div>
      </div>
    </div>
  );
};

export default PerformanceCardsPanel; 