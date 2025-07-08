// CompetitionCardsPanel.js
import React from 'react';

const CompetitionCardsPanel = () => {
  return (
    <div className="space-y-4">
      {/* Sektörün en çok kullanılan creator'ları */}
      <div className="p-4 bg-gray-50 rounded-lg shadow border">
        <div className="font-bold mb-1">Sektörde Popüler Creator'lar</div>
        <ul className="list-disc ml-5 text-sm text-gray-700">
          <li>@populer1 (Kozmetik, 1.2M takipçi)</li>
          <li>@populer2 (Moda, 900K takipçi)</li>
          <li>@populer3 (Teknoloji, 700K takipçi)</li>
        </ul>
      </div>
      {/* Başarı örnekleri */}
      <div className="p-4 bg-gray-50 rounded-lg shadow border">
        <div className="font-bold mb-1">Başarı Hikayeleri</div>
        <div className="text-gray-700 text-sm">
          <b>ABC Kozmetik</b> firması, <b>@populer1</b> ile yaptığı kampanya sonrası satışlarını %35 artırdı.<br />
          <b>XYZ Moda</b> markası, <b>@populer2</b> ile iş birliğiyle sosyal medya etkileşimini ikiye katladı.
        </div>
      </div>
    </div>
  );
};

export default CompetitionCardsPanel; 