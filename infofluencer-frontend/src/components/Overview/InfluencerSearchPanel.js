// [A] InfluencerSearchPanel: Influencer arama ve scraping paneli

/**
 * InfluencerSearchPanel, kullanıcıya @username ile arama yapma ve public/bağlı hesap verilerini gösterme panelidir.
 * Sonuçlar özel kartlarda gösterilir, gelişmiş rapor butonu ve detay linkleri içerir.
 */
import React, { useState } from 'react';

const InfluencerSearchPanel = () => {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState([]); // Sonuçlar ileride API ile dolacak

  // Sticky arama barı ve örnek sonuç kutusu
  return (
    <div className="relative">
      {/* Sticky arama barı */}
      <div className="sticky top-0 z-10 bg-white pb-4">
        <form
          onSubmit={e => { e.preventDefault(); /* Arama fonksiyonu eklenecek */ }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="@username ile influencer ara..."
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Ara
          </button>
        </form>
      </div>
      {/* Sonuçlar kutusu (örnek) */}
      <div className="mt-6 space-y-4">
        {/* Örnek sonuç kutusu, ileride map ile çoğaltılacak */}
        <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow border">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profil" className="w-14 h-14 rounded-full mr-4" />
          <div className="flex-1">
            <div className="font-bold">@ornekuser</div>
            <div className="text-sm text-gray-500">Bio: Influencer, seyahat ve yaşam tarzı içerikleri</div>
            <div className="text-xs text-gray-400">Gönderi: 120 | ER: %4.2</div>
            <div className="flex gap-2 mt-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Advanced Raporu Gör</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerSearchPanel; 