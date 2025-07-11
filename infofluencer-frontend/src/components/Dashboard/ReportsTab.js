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
    const summary = data?.summary || {};
    // 0 değerli satırları filtrele
    const trafficSources = (data?.traffic_sources || []).filter(t => t.new_users > 0);
    const deviceCategories = (data?.device_categories || []).filter(d => d.active_users > 0);
    const geo = (data?.geo || []).filter(g => g.active_users > 0);
    // Demografi verileri
    const ageData = (data?.demographics?.age || []).filter(a => {
      const label = (a.user_age_bracket || a.age || a.dimension || a.label || '').toLowerCase();
      return (a.active_users > 0 || a.users > 0 || a.count > 0) && label !== 'unknown' && label !== '(not set)';
    });
    const genderData = (data?.demographics?.gender || []).filter(g => g.active_users > 0 || g.users > 0 || g.count > 0);
    const interestData = (data?.demographics?.interest || []).filter(i => i.active_users > 0 || i.users > 0 || i.count > 0);

    // Yaş Dağılımı Bar Chart
    const ageLabels = ageData.map(a => a.user_age_bracket || a.age || a.dimension || a.label);
    const ageValues = ageData.map(a => a.active_users || a.users || a.count || 0);
    const ageChartData = {
      labels: ageLabels,
      datasets: [{
        label: 'Kullanıcı',
        data: ageValues,
        backgroundColor: 'rgba(255, 140, 0, 0.6)',
        borderColor: 'rgba(255, 140, 0, 1)',
        borderWidth: 1,
      }],
    };

    // Cinsiyet Dağılımı Pie Chart
    const genderLabels = genderData.map(g => g.user_gender || g.gender || g.dimension || g.label);
    const genderValues = genderData.map(g => g.active_users || g.users || g.count || 0);
    const genderChartData = {
      labels: genderLabels,
      datasets: [{
        data: genderValues,
        backgroundColor: [
          'rgba(255, 140, 0, 0.8)',
          'rgba(255, 99, 71, 0.8)',
          'rgba(255, 182, 193, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };

    // İlgi Alanı Dağılımı Bar Chart
    const interestLabels = interestData.map(i => i.interest_category || i.category || i.dimension || i.label);
    const interestValues = interestData.map(i => i.active_users || i.users || i.count || 0);
    const interestChartData = {
      labels: interestLabels,
      datasets: [{
        label: 'Kullanıcı',
        data: interestValues,
        backgroundColor: 'rgba(255, 140, 0, 0.6)',
        borderColor: 'rgba(255, 140, 0, 1)',
        borderWidth: 1,
      }],
    };

    // Trafik Kaynakları Bar Chart
    const trafficSourceLabels = trafficSources.map(t => t.acquisition_source);
    const trafficSourceData = trafficSources.map(t => t.new_users);
    const trafficSourceChartData = {
      labels: trafficSourceLabels,
      datasets: [{
        label: 'Yeni Kullanıcı',
        data: trafficSourceData,
        backgroundColor: 'rgba(255, 140, 0, 0.6)',
        borderColor: 'rgba(255, 140, 0, 1)',
        borderWidth: 1,
      }],
    };

    // Cihaz Dağılımı Bar Chart
    const deviceLabels = deviceCategories.map(d => d.device_category);
    const deviceData = deviceCategories.map(d => d.active_users);
    const deviceChartData = {
      labels: deviceLabels,
      datasets: [{
        label: 'Aktif Kullanıcı',
        data: deviceData,
        backgroundColor: 'rgba(255, 140, 0, 0.6)',
        borderColor: 'rgba(255, 140, 0, 1)',
        borderWidth: 1,
      }],
    };

    // Ülke Dağılımı Bar Chart
    const geoLabels = geo.map(g => g.country);
    const geoData = geo.map(g => g.active_users);
    const geoChartData = {
      labels: geoLabels,
      datasets: [{
        label: 'Aktif Kullanıcı',
        data: geoData,
        backgroundColor: 'rgba(255, 140, 0, 0.6)',
        borderColor: 'rgba(255, 140, 0, 1)',
        borderWidth: 1,
      }],
    };

    return (
      <div className="space-y-6">
        {/* Özet Stat Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4 text-center border-b-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">{formatNumber(summary?.total_users ?? 0)}</div>
            <div className="text-sm text-gray-600">Toplam Kullanıcı</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center border-b-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">{formatNumber(summary?.conversions ?? 0)}</div>
            <div className="text-sm text-gray-600">Dönüşüm</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center border-b-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">%{summary?.conversion_rate ?? 0}</div>
            <div className="text-sm text-gray-600">Dönüşüm Oranı</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center border-b-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">{summary?.avg_session_duration ?? 0} sn</div>
            <div className="text-sm text-gray-600">Ort. Oturum Süresi</div>
          </div>
        </div>

        {/* Trafik Kaynakları Bar Chart ve Tablo */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-center" style={{ maxWidth: 900, margin: '0 auto' }}>
          <h3 className="text-lg font-semibold text-orange-700 mb-4">Trafik Kaynakları</h3>
          <div style={{ width: '100%', maxWidth: 600, height: 260 }}>
            <Bar
              data={trafficSourceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
          <div className="overflow-x-auto mt-6 w-full">
            <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ maxWidth: 700, margin: '0 auto' }}>
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Kaynak</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Yeni Kullanıcı</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Oturum</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Dönüşüm</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Etkileşim Oranı</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Ort. Etkileşim Süresi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trafficSources.map((t, i) => (
                  <tr key={i} className="hover:bg-orange-50">
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{t.acquisition_source}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(t.new_users)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(t.sessions)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(t.conversions)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{(t.engagement_rate * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{Math.round(t.user_engagement_duration / (t.sessions || 1))} sn</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cihaz Dağılımı Bar Chart ve Tablo */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-center" style={{ maxWidth: 900, margin: '0 auto' }}>
          <h3 className="text-lg font-semibold text-orange-700 mb-4">Cihaz Dağılımı</h3>
          <div style={{ width: '100%', maxWidth: 600, height: 260 }}>
            <Bar
              data={deviceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
          <div className="overflow-x-auto mt-6 w-full">
            <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ maxWidth: 700, margin: '0 auto' }}>
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Cihaz</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Aktif Kullanıcı</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Etkileşimli Oturum</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Ort. Etkileşim Süresi</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Olay Sayısı</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Bounce Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deviceCategories.map((d, i) => (
                  <tr key={i} className="hover:bg-orange-50">
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{d.device_category}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(d.active_users)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(d.engaged_sessions)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{Math.round(d.user_engagement_duration / (d.engaged_sessions || 1))} sn</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(d.event_count)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{(d.bounce_rate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ülke Dağılımı Bar Chart ve Tablo */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-center" style={{ maxWidth: 900, margin: '0 auto' }}>
          <h3 className="text-lg font-semibold text-orange-700 mb-4">Ülke Dağılımı</h3>
          <div style={{ width: '100%', maxWidth: 600, height: 260 }}>
            <Bar
              data={geoChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
          <div className="overflow-x-auto mt-6 w-full">
            <table className="min-w-full divide-y divide-gray-200 text-sm" style={{ maxWidth: 700, margin: '0 auto' }}>
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Ülke</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Aktif Kullanıcı</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Yeni Kullanıcı</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Oturum</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Dönüşüm</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Etkileşim Oranı</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-orange-700 uppercase">Bounce Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {geo.map((g, i) => (
                  <tr key={i} className="hover:bg-orange-50">
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{g.country}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(g.active_users)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(g.new_users)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(g.sessions)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{formatNumber(g.conversions)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{(g.engagement_rate * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900">{(g.bounce_rate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demografi: Yaş Dağılımı */}
        {ageData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 flex flex-col items-center" style={{ maxWidth: 600, margin: '0 auto' }}>
            <h3 className="text-lg font-semibold text-orange-700 mb-4">Yaş Dağılımı</h3>
            <div style={{ width: '100%', maxWidth: 400, height: 260 }}>
              <Bar
                data={ageChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>
        )}

        {/* Demografi: Cinsiyet Dağılımı */}
        {genderData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-orange-700 mb-4">Cinsiyet Dağılımı</h3>
            <Doughnut
              data={genderChartData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        )}

        {/* Demografi: İlgi Alanı Dağılımı */}
        {interestData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-orange-700 mb-4">İlgi Alanı Dağılımı</h3>
            <Bar
              data={interestChartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderYouTubeReport = () => {
    if (!data) return null;
    const summary = data?.summary || {};
    // traffic_sources, age_groups, device_types için uygun grafikler
    const trafficSources = data?.traffic_sources || [];
    const ageGroups = data?.audience?.age_groups || [];
    const deviceTypes = data?.device_types || [];

    // Trafik Kaynakları Bar Chart
    const trafficSourceLabels = trafficSources.map(item => item.insightTrafficSourceType);
    const trafficSourceData = trafficSources.map(item => item.views);
    const trafficSourceChartData = {
      labels: trafficSourceLabels,
      datasets: [{
        label: 'İzlenme',
        data: trafficSourceData,
        backgroundColor: 'rgba(255, 140, 0, 0.6)',
        borderColor: 'rgba(255, 140, 0, 1)',
        borderWidth: 1,
      }],
    };

    // Yaş & Cinsiyet Donut Chart
    const ageGenderLabels = ageGroups.map(item => `${item.gender} - ${item.ageGroup}`);
    const ageGenderData = ageGroups.map(item => item.viewerPercentage);
    const ageGenderChartData = {
      labels: ageGenderLabels,
      datasets: [{
        data: ageGenderData,
        backgroundColor: [
          'rgba(239,68,68,0.8)',
          'rgba(16,185,129,0.8)',
          'rgba(59,130,246,0.8)',
          'rgba(255,140,0,0.8)',
          'rgba(255,99,71,0.8)',
          'rgba(255,127,80,0.8)',
          'rgba(255,160,122,0.8)',
          'rgba(255,182,193,0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };

    // Cihaz Dağılımı Bar Chart
    const deviceLabels = deviceTypes.map(item => item.deviceType);
    const deviceData = deviceTypes.map(item => item.views);
    const deviceChartData = {
      labels: deviceLabels,
      datasets: [{
        label: 'İzlenme',
        data: deviceData,
        backgroundColor: 'rgba(16,185,129,0.6)',
        borderColor: 'rgba(16,185,129,1)',
        borderWidth: 1,
      }],
    };

    return (
      <div className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🎥</span>
            YouTube Genel Bakış
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatNumber(summary?.total_views ?? 0)}</div>
              <div className="text-sm text-gray-600">Toplam İzlenme</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{formatNumber(summary?.total_likes ?? 0)}</div>
              <div className="text-sm text-gray-600">Beğeni</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(summary?.total_comments ?? 0)}</div>
              <div className="text-sm text-gray-600">Yorum</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{formatNumber(summary?.subscribers_gained ?? 0)}</div>
              <div className="text-sm text-gray-600">Abone Artışı</div>
            </div>
          </div>
        </div>

        {/* Trafik Kaynakları Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trafik Kaynakları</h3>
          <Bar
            data={trafficSourceChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>

        {/* Yaş & Cinsiyet Dağılımı Donut Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Yaş & Cinsiyet Dağılımı</h3>
          <Doughnut
            data={ageGenderChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
            }}
          />
        </div>

        {/* Cihaz Dağılımı Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cihaz Dağılımı</h3>
          <Bar
            data={deviceChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
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