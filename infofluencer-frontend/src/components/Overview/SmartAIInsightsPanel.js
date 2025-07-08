import React from 'react';

const SmartAIInsightsPanel = () => {
  // Pro plan kontrolü ileride eklenecek (ör: isProPlan prop)
  const isProPlan = false; // Şimdilik sabit

  return (
    <div>
      {!isProPlan && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
          Bu panel Pro plan kullanıcılarına özeldir. Yükseltmek için <button className="underline text-orange-600">planınızı yükseltin</button>.
        </div>
      )}
      <div className="space-y-4">
        {/* Örnek AI öneri kartı */}
        <div className="p-4 bg-gray-50 rounded-lg shadow border">
          <div className="font-bold mb-1">AI Önerisi</div>
          <div className="text-gray-700 text-sm">
            Sitenizi ziyaret eden kullanıcıların %63'ü 25-34 yaş arası erkek. Bu hedefe uygun creatorlar şunlardır: <span className="font-semibold">@influencer1, @influencer2</span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg shadow border">
          <div className="font-bold mb-1">AI Önerisi</div>
          <div className="text-gray-700 text-sm">
            Son kampanyanızın etkisi azalmış olabilir. <span className="font-semibold">@influencer3</span> ile yeni bir kampanya başlatmayı düşünebilirsiniz.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAIInsightsPanel; 