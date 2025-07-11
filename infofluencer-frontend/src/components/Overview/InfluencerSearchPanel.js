// [A] InfluencerSearchPanel: Influencer arama ve scraping paneli

/**
 * InfluencerSearchPanel, kullanıcıya @username ile arama yapma ve public/bağlı hesap verilerini gösterme panelidir.
 * Sonuçlar özel kartlarda gösterilir, gelişmiş rapor butonu ve detay linkleri içerir.
 */
import React, { useState } from 'react';

const InfluencerSearchPanel = () => {
  const [username, setUsername] = useState('');
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 bg-white pb-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (username.trim() === '@ornekuser') {
              setShowResult(true);
            } else {
              setShowResult(false);
            }
          }}
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
      {/* Animasyonlu influencer kartı */}
      <div
        className={`transition-all duration-500 overflow-hidden ${showResult ? 'max-h-40 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}
      >
        <div className="flex items-center bg-purple-50 rounded-xl shadow p-4 gap-4 max-w-xl">
          <img src="/profile.png" alt="Profil" className="w-16 h-16 rounded-full object-cover border-2 border-orange-400" />
          <div className="flex-1">
            <div className="font-bold text-lg">@ornekuser</div>
            <div className="text-gray-600 text-sm mb-1">Bio: Influencer, seyahat ve yaşam tarzı içerikleri</div>
            <div className="text-gray-500 text-xs">Gönderi: 120 | ER: %4.2</div>
          </div>
          <button className="bg-gradient-to-r from-orange-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow hover:scale-105 transition">Advanced Raporu Gör</button>
        </div>
      </div>
    </div>
  );
};

export default InfluencerSearchPanel; 