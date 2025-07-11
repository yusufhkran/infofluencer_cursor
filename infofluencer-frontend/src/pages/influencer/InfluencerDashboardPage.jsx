import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/InfluencerDashboard/Sidebar';
import TopBar from '../../components/InfluencerDashboard/TopBar';
import ApiConnectionsCard from '../../components/InfluencerDashboard/ApiConnectionsCard';
import ProfileCard from '../../components/InfluencerDashboard/ProfileCard';
import { getInstagramFullReport } from '../../services/instagramApi';
import AudienceKPI from '../../components/InfluencerDashboard/AudienceKPI';
import AudienceBadges from '../../components/InfluencerDashboard/AudienceBadges';
import AudienceGeoChart from '../../components/InfluencerDashboard/AudienceGeoChart';
import AudienceDemographyChart from '../../components/InfluencerDashboard/AudienceDemographyChart';
import NotableFollowersList from '../../components/InfluencerDashboard/NotableFollowersList';

const OverviewCard = ({ categories, followers, followersGrowth, engagementRate, postFrequency }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-orange-50 min-h-[320px] w-full">
    <div className="text-xl font-bold text-[#FF6A00] mb-2">Overview</div>
    <div className="flex flex-col gap-2 text-gray-700 text-sm">
      <div><span className="font-semibold">Kategoriler:</span> {categories && categories.length ? categories.join(', ') : '-'}</div>
      <div><span className="font-semibold">Takipçi:</span> {followers}</div>
      <div><span className="font-semibold">30 Günde Takipçi Artışı:</span> {followersGrowth}</div>
      <div><span className="font-semibold">Etkileşim Oranı:</span> %{engagementRate}</div>
      <div><span className="font-semibold">Post Sıklığı (30g):</span> {postFrequency} paylaşım</div>
    </div>
  </div>
);

const InfluencerDashboardPage = () => {
  const [igToken, setIgToken] = useState(() => localStorage.getItem('ig_token'));
  const [igData, setIgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInstagramData = useCallback(async (token) => {
    setLoading(true);
    setError('');
    try {
      const data = await getInstagramFullReport(token);
      setIgData(data);
    } catch (err) {
      setError('Instagram verileri alınamadı: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (igToken) {
      fetchInstagramData(igToken);
    }
  }, [igToken, fetchInstagramData]);

  const profile = igData?.profile || {};
  const overview = igData?.overview || {};
  const demographics = igData?.demographics || {};
  const userInsights = igData?.user_insights || {};
  const calculatedMetrics = igData?.calculated_metrics || {};
  const mediaData = igData?.media_data || {};

  return (
    <div className="min-h-screen flex bg-[#1F1F1F] font-inter">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 md:p-10 bg-[#FDFDFD] rounded-tl-3xl shadow-inner">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#FF6A00] mb-6">
            Welcome back, <span className="text-[#1F1F1F]">@{profile.username || 'username'}</span> 👋
          </h1>
          
          {/* Ana Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <ProfileCard
              name={profile.name}
              username={profile.username}
              profilePic={profile.profile_picture_url}
              followers={profile.followers}
              location={profile.location}
              email={profile.email}
              biography={profile.biography}
              website={profile.website}
            />
            <OverviewCard
              categories={overview.categories}
              followers={overview.followers}
              followersGrowth={overview.followers_growth}
              engagementRate={overview.engagement_rate}
              postFrequency={overview.post_frequency}
            />
            <ApiConnectionsCard onInstagramConnected={setIgToken} />
          </div>
          
          {loading && <div className="text-gray-500">Instagram verileri yükleniyor...</div>}
          {error && <div className="text-red-500">{error}</div>}
          
          {/* KPI Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <AudienceKPI 
              label="Engagement Rate" 
              value={`${calculatedMetrics.engagement_rate || 0}%`} 
              sublabel="Etkileşim Oranı" 
              color="#10B981" 
            />
            <AudienceKPI 
              label="Influencer Score" 
              value={calculatedMetrics.influencer_score || 0} 
              sublabel="Etki Puanı" 
              color="#6366F1" 
            />
            <AudienceKPI 
              label="Posting Frequency" 
              value={`${calculatedMetrics.posting_frequency || 0}/gün`} 
              sublabel="Günlük Paylaşım" 
              color="#F59E42" 
            />
            <AudienceKPI 
              label="Followers Growth" 
              value={calculatedMetrics.followers_growth || 0} 
              sublabel="30 Günlük Artış" 
              color="#EF4444" 
            />
          </div>
          
          {/* Top Demografi Badge'leri */}
          <div className="mb-8">
            <AudienceBadges items={[
              { label: 'Top Country', value: demographics.top_country || '-', icon: '🌍' },
              { label: 'Top City', value: demographics.top_city || '-', icon: '🏙️' },
              { label: 'Top Gender', value: demographics.top_gender || '-', icon: '👤' },
              { label: 'Top Age', value: demographics.top_age || '-', icon: '🎂' },
            ]} />
          </div>
          
          {/* Coğrafi Dağılım Chartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <AudienceGeoChart 
              data={demographics.country_distribution || []} 
              title="Ülke Dağılımı" 
            />
            <AudienceGeoChart 
              data={demographics.city_distribution || []} 
              title="Şehir Dağılımı" 
            />
          </div>
          
          {/* Demografi Chart */}
          <div className="grid grid-cols-1 mb-8">
            <AudienceDemographyChart 
              data={demographics.age_distribution || []} 
              title="Yaş & Cinsiyet Dağılımı" 
            />
          </div>
          
          {/* Medya Performans Özeti */}
          {mediaData && mediaData.media_details && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="text-xl font-bold text-[#FF6A00] mb-4">📊 Medya Performans Özeti</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mediaData.total_media_analyzed || 0}</div>
                  <div className="text-sm text-gray-600">Analiz Edilen Medya</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mediaData.total_likes || 0}</div>
                  <div className="text-sm text-gray-600">Toplam Beğeni</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{mediaData.total_comments || 0}</div>
                  <div className="text-sm text-gray-600">Toplam Yorum</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{mediaData.average_likes_per_post || 0}</div>
                  <div className="text-sm text-gray-600">Ortalama Beğeni</div>
                </div>
              </div>
            </div>
          )}
          
          {/* User Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="text-xl font-bold text-[#FF6A00] mb-4">📈 Kullanıcı İçgörüleri</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userInsights.reach || 0}</div>
                <div className="text-sm text-gray-600">Toplam Erişim</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userInsights.profile_views || 0}</div>
                <div className="text-sm text-gray-600">Profil Görüntüleme</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userInsights.website_clicks || 0}</div>
                <div className="text-sm text-gray-600">Website Tıklama</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{userInsights.follower_count || 0}</div>
                <div className="text-sm text-gray-600">Takipçi Sayısı</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InfluencerDashboardPage; 