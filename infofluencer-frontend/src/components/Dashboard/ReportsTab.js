import React, { useState, useEffect } from 'react';
import { tokenUtils } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Bilgi kutusu bileşeni
const InfoBox = ({ children }) => (
  <span className="ml-2 inline-block align-middle">
    <span className="group relative cursor-pointer">
      <span className="text-orange-500 text-lg font-bold">ⓘ</span>
      <span className="absolute left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded bg-white p-3 text-xs text-gray-700 shadow-lg border border-orange-200 group-hover:block">
        {children}
      </span>
    </span>
  </span>
);

const ReportsTab = () => {
  const [activeTab, setActiveTab] = useState('instagram');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchReport = async (platform) => {
    setLoading(true);
    setError('');
    setData(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/company/reports/${platform}/`, {
        headers: { Authorization: `Bearer ${tokenUtils.getAccessToken()}` },
      });
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Veri alınamadı');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab) {
      fetchReport(activeTab);
    }
  }, [activeTab]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Yardımcı hesaplama fonksiyonları
  const calculateGrowthRate = (mediaData, followers) => {
    // Son 5 medya öncesi ve sonrası takipçi farkı / önceki takipçi sayısı
    // Not: API'den geçmiş takipçi verisi yoksa, bu metrik son 5 medya öncesi ve sonrası toplam etkileşim ile tahmini hesaplanır
    // Burada örnek olarak: ilk medya ile son medya arasındaki takipçi farkı
    if (!mediaData || mediaData.length < 2 || !followers) return null;
    // Gerçek takipçi verisi yoksa, null döndür
    return null;
  };

  const calculateEngagementRate = (mediaData, followers) => {
    if (!mediaData || !followers) return null;
    const totalLikes = mediaData.reduce((sum, m) => sum + (m.like_count || 0), 0);
    const totalComments = mediaData.reduce((sum, m) => sum + (m.comments_count || 0), 0);
    return ((totalLikes + totalComments) / (followers * mediaData.length)) * 100;
  };

  const calculateAudienceQualityScore = (mediaData, followers) => {
    if (!mediaData || !followers) return null;
    // Basit skor: (engagement rate * yorum/beğeni oranı * 100) ile normalize
    const engagement = calculateEngagementRate(mediaData, followers);
    const totalLikes = mediaData.reduce((sum, m) => sum + (m.like_count || 0), 0);
    const totalComments = mediaData.reduce((sum, m) => sum + (m.comments_count || 0), 0);
    const commentLikeRatio = totalLikes ? totalComments / totalLikes : 0;
    // Skor 0-100 arası normalize edilir
    let score = engagement * (0.7 + 0.3 * commentLikeRatio);
    if (score > 100) score = 100;
    return score;
  };

  const calculateCommentLikeRatio = (mediaData) => {
    if (!mediaData) return null;
    const totalLikes = mediaData.reduce((sum, m) => sum + (m.like_count || 0), 0);
    const totalComments = mediaData.reduce((sum, m) => sum + (m.comments_count || 0), 0);
    return totalLikes ? totalComments / totalLikes : 0;
  };

  const calculateAvgCommentLength = (mediaData) => {
    if (!mediaData) return null;
    let totalLength = 0;
    let totalComments = 0;
    mediaData.forEach(m => {
      if (m.comments_analysis && m.comments_analysis.comment_texts) {
        m.comments_analysis.comment_texts.forEach(c => {
          totalLength += (c.text || '').length;
          totalComments++;
        });
      }
    });
    return totalComments ? totalLength / totalComments : 0;
  };

  const renderInstagramReport = () => {
    if (!data) return null;

    const { basic_info, media_data, demographics, user_insights, calculated_metrics } = data;
    const mediaList = media_data?.data?.slice(0, 5) || [];
    const followers = basic_info?.followers_count || 0;

    // METRİKLER
    const engagementRate = calculateEngagementRate(mediaList, followers);
    const audienceQualityScore = calculateAudienceQualityScore(mediaList, followers);
    const commentLikeRatio = calculateCommentLikeRatio(mediaList);
    const avgCommentLength = calculateAvgCommentLength(mediaList);
    // Büyüme oranı için geçmiş takipçi verisi API'den gelirse eklenebilir
    // Şimdilik null döndürülüyor
    const growthRate = null;

    // Medya performans grafiği için veri hazırlama
    const mediaChartData = {
      labels: media_data?.data?.slice(0, 5).map(media => 
        media.caption?.substring(0, 20) + '...' || 'Medya'
      ) || [],
      datasets: [
        {
          label: 'Beğeni',
          data: media_data?.data?.slice(0, 5).map(media => media.like_count) || [],
          backgroundColor: 'rgba(255, 140, 0, 0.8)',
          borderColor: 'rgba(255, 140, 0, 1)',
          borderWidth: 2,
        },
        {
          label: 'Yorum',
          data: media_data?.data?.slice(0, 5).map(media => media.comments_count) || [],
          backgroundColor: 'rgba(255, 69, 0, 0.8)',
          borderColor: 'rgba(255, 69, 0, 1)',
          borderWidth: 2,
        },
      ],
    };

    // Demografik yaş dağılımı
    const ageData = demographics?.follower_demographics_age?.data?.[0]?.total_value?.breakdowns?.[0]?.results || [];
    const ageChartData = {
      labels: ageData.map(item => item.dimension_values[0]),
      datasets: [{
        data: ageData.map(item => item.value),
        backgroundColor: [
          'rgba(255, 140, 0, 0.8)',
          'rgba(255, 165, 0, 0.8)',
          'rgba(255, 69, 0, 0.8)',
          'rgba(255, 99, 71, 0.8)',
          'rgba(255, 127, 80, 0.8)',
          'rgba(255, 160, 122, 0.8)',
          'rgba(255, 182, 193, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };

    // Şehir dağılımı (top 10)
    const cityData = demographics?.follower_demographics_city?.data?.[0]?.total_value?.breakdowns?.[0]?.results?.slice(0, 10) || [];
    const cityChartData = {
      labels: cityData.map(item => item.dimension_values[0].split(',')[0]),
      datasets: [{
        label: 'Takipçi Sayısı',
        data: cityData.map(item => item.value),
        backgroundColor: 'rgba(255, 140, 0, 0.6)',
        borderColor: 'rgba(255, 140, 0, 1)',
        borderWidth: 1,
      }],
    };

    return (
      <div className="space-y-6">
        {/* Temel Bilgiler ve Ek Metrikler */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">📊</span>
            Hesap Genel Bakış
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatNumber(basic_info?.followers_count || 0)}</div>
              <div className="text-sm text-gray-600">Takipçi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatNumber(basic_info?.media_count || 0)}</div>
              <div className="text-sm text-gray-600">Medya</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatNumber(basic_info?.follows_count || 0)}</div>
              <div className="text-sm text-gray-600">Takip Edilen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{calculated_metrics?.posting_frequency?.toFixed(2) || 0}</div>
              <div className="text-sm text-gray-600">Günlük Paylaşım</div>
            </div>
          </div>
          {/* Ek Metrikler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center bg-orange-50 rounded-lg p-3">
              <div className="text-xl font-bold text-orange-700">{engagementRate ? engagementRate.toFixed(2) + '%' : '-'}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center">Engagement Rate
                <InfoBox>Engagement Rate = (Toplam Beğeni + Toplam Yorum) / (Takipçi x 5 medya) × 100</InfoBox>
              </div>
            </div>
            <div className="text-center bg-orange-50 rounded-lg p-3">
              <div className="text-xl font-bold text-orange-700">{audienceQualityScore ? audienceQualityScore.toFixed(1) : '-'}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center">Audience Quality Score
                <InfoBox>Takipçi başına etkileşim, yorum/beğeni oranı ve engagement rate ile normalize edilen skor. 0-100 arası.</InfoBox>
              </div>
            </div>
            <div className="text-center bg-orange-50 rounded-lg p-3">
              <div className="text-xl font-bold text-orange-700">{commentLikeRatio ? commentLikeRatio.toFixed(2) : '-'}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center">Yorum/Beğeni Oranı
                <InfoBox>Yorum/Beğeni Oranı = Toplam Yorum / Toplam Beğeni</InfoBox>
              </div>
            </div>
            <div className="text-center bg-orange-50 rounded-lg p-3">
              <div className="text-xl font-bold text-orange-700">{avgCommentLength ? avgCommentLength.toFixed(1) + ' karakter' : '-'}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center">Ort. Yorum Uzunluğu
                <InfoBox>Ortalama Yorum Uzunluğu = Tüm yorum metinlerinin toplam karakteri / Yorum sayısı</InfoBox>
              </div>
            </div>
          </div>
        </div>

        {/* Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medya Performans Grafiği */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Son 5 Medya Performansı</h3>
            <Bar 
              data={mediaChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          {/* Yaş Dağılımı */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Takipçi Yaş Dağılımı</h3>
            <Doughnut 
              data={ageChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Şehir Dağılımı */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">En Popüler Şehirler</h3>
          <Bar 
            data={cityChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* Medya Detayları Tablosu */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Son Medya Detayları</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medya</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beğeni</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yorum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erişim</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {media_data?.data?.slice(0, 5).map((media, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {media.caption?.substring(0, 50) + '...' || 'Açıklama yok'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(media.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(media.like_count || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(media.comments_count || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(media.insights?.reach?.data?.[0]?.values?.[0]?.value || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 28 Günlük Metrikler */}
        {user_insights && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">28 Günlük Performans</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(user_insights).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {formatNumber(value?.data?.[0]?.total_value?.value || 0)}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {key.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGA4Report = () => {
    if (!data) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">GA4 Raporu</h3>
        <p className="text-gray-600">GA4 rapor verileri burada görüntülenecek</p>
      </div>
    );
  };

  const renderYouTubeReport = () => {
    if (!data) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">YouTube Raporu</h3>
        <p className="text-gray-600">YouTube rapor verileri burada görüntülenecek</p>
      </div>
    );
  };

  const renderReport = () => {
    switch (activeTab) {
      case 'instagram':
        return renderInstagramReport();
      case 'ga4':
        return renderGA4Report();
      case 'youtube':
        return renderYouTubeReport();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📈 Raporlarım</h2>
        <p className="text-gray-600">Platform performansınızı analiz edin</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('instagram')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
            activeTab === 'instagram'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📸 Instagram
        </button>
        <button
          onClick={() => setActiveTab('ga4')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
            activeTab === 'ga4'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📊 GA4
        </button>
        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
            activeTab === 'youtube'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🎥 YouTube
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Veriler yükleniyor...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      {!loading && !error && renderReport()}
    </div>
  );
};

export default ReportsTab; 