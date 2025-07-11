import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import { showMessage } from '../../utils/showMessage';
import { formatNumber } from '../../utils/format';
import { 
  getInstagramBasicInfo, 
  getInstagramMediaData, 
  getInstagramDemographics, 
  getInstagramInsights, 
  getInstagramStories, 
  getInstagramCalculatedMetrics, 
  refreshInstagramData,
  getInstagramConnectionStatus
} from '../../services/analyticsApi';

const InstagramCard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnected, setIsConnected] = useState(false);

  const fetchInstagramData = async (endpoint) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (endpoint) {
        case 'basic':
          result = await getInstagramBasicInfo();
          break;
        case 'media':
        case 'comments':
          result = await getInstagramMediaData();
          break;
        case 'demographics':
          result = await getInstagramDemographics();
          break;
        case 'insights':
          result = await getInstagramInsights();
          break;
        case 'stories':
          result = await getInstagramStories();
          break;
        case 'calculated':
          result = await getInstagramCalculatedMetrics();
          break;
        default:
          result = await getInstagramBasicInfo();
      }
      
      // Token otomatik yenilendiyse kullanıcıya uyarı göster
      if (result && result.error && result.error.includes('token süresi dolmuş ve yenileme başarısız')) {
        showMessage('Instagram erişim anahtarınızın süresi doldu ve otomatik yenileme başarısız oldu. Lütfen hesabınızı tekrar bağlayın.', 'error');
      } else if (result && result.details && result.details.includes('token yenilendi')) {
        showMessage('Instagram erişim anahtarınız otomatik olarak yenilendi.', 'info');
      }
      if (result.success) {
        setData(result.data);
        showMessage('Instagram verileri başarıyla yüklendi', 'success');
      } else {
        setError(result.error || 'Veri yüklenirken hata oluştu');
        showMessage(result.error || 'Veri yüklenirken hata oluştu', 'error');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu');
      showMessage('Bağlantı hatası oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const result = await refreshInstagramData();
      
      if (result.success) {
        setData(result.data);
        showMessage('Veriler başarıyla yenilendi', 'success');
      } else {
        showMessage(result.error || 'Veri yenileme hatası', 'error');
      }
    } catch (err) {
      showMessage('Veri yenileme hatası', 'error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const result = await getInstagramConnectionStatus();
      setIsConnected(result.connected);
      
      if (result.connected) {
        fetchInstagramData('basic');
      }
    } catch (err) {
      console.error('Instagram bağlantı kontrolü hatası:', err);
    }
  };

  const renderOverview = () => {
    if (!data?.basic_info) return <p>Veri bulunamadı</p>;

    const info = data.basic_info;
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <img 
              src={info.profile_picture_url} 
              alt="Profile" 
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{info.name || info.username}</h3>
              <p className="text-sm text-gray-600">@{info.username}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">{info.biography}</p>
          {info.website && (
            <a 
              href={info.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              {info.website}
            </a>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Takipçi:</span>
            <span className="font-semibold">{formatNumber(info.followers_count)}</span>
          </div>
          <div className="flex justify-between">
            <span>Takip Edilen:</span>
            <span className="font-semibold">{formatNumber(info.follows_count)}</span>
          </div>
          <div className="flex justify-between">
            <span>Medya:</span>
            <span className="font-semibold">{formatNumber(info.media_count)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMedia = () => {
    if (!data?.media_data?.data) return <p>Medya verisi bulunamadı</p>;

    const mediaItems = data.media_data.data; // Son 5 medya (zaten backend'den 5 tane geliyor)
    return (
      <div className="space-y-4">
        {mediaItems.map((media) => (
          <div key={media.id} className="border rounded-lg p-3">
            <div className="flex items-start space-x-3">
              {media.thumbnail_url && (
                <img 
                  src={media.thumbnail_url} 
                  alt="Media" 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {media.caption || 'Açıklama yok'}
                </p>
                <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                  <span>❤️ {formatNumber(media.like_count || 0)}</span>
                  <span>💬 {formatNumber(media.comments_count || 0)}</span>
                  <span className="capitalize">{media.media_type?.toLowerCase()}</span>
                </div>
                
                {/* Yorum metinleri göster */}
                {media.comments_analysis?.comment_texts && media.comments_analysis.comment_texts.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h5 className="text-sm font-semibold mb-2">Yorumlar:</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {media.comments_analysis.comment_texts.slice(0, 3).map((comment, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="font-medium text-gray-700">@{comment.username}</div>
                          <div className="text-gray-600">{comment.text}</div>
                        </div>
                      ))}
                      {media.comments_analysis.comment_texts.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{media.comments_analysis.comment_texts.length - 3} yorum daha...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDemographics = () => {
    if (!data?.demographics) return <p>Demografik veri bulunamadı</p>;

    const demo = data.demographics;
    return (
      <div className="space-y-4">
        {Object.entries(demo).map(([key, value]) => (
          <div key={key} className="border rounded-lg p-3">
            <h4 className="font-semibold mb-2 capitalize">
              {key.replace('follower_demographics_', '').replace('_', ' ')}
            </h4>
            {value?.data && (
              <div className="space-y-1">
                {value.data.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-semibold">{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInsights = () => {
    if (!data?.user_insights) return <p>Insights verisi bulunamadı</p>;

    const insights = data.user_insights;
    return (
      <div className="space-y-4">
        {Object.entries(insights).map(([key, value]) => (
          <div key={key} className="border rounded-lg p-3">
            <h4 className="font-semibold mb-2 capitalize">
              {key.replace('_', ' ')}
            </h4>
            {value?.data && (
              <div className="space-y-1">
                {value.data.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.date || item.end_time}</span>
                    <span className="font-semibold">{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCalculatedMetrics = () => {
    if (!data?.calculated_metrics) return <p>Hesaplanmış metrik bulunamadı</p>;

    const metrics = data.calculated_metrics;
    return (
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="border rounded-lg p-3 text-center">
            <h4 className="font-semibold mb-1 capitalize">
              {key.replace('_', ' ')}
            </h4>
            <p className="text-2xl font-bold text-blue-600">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderComments = () => {
    if (!data?.media_data?.data) return <p>Medya verisi bulunamadı</p>;

    const allComments = [];
    
    // Tüm medyalardan yorumları topla
    data.media_data.data.forEach((media) => {
      if (media.comments_analysis?.comment_texts) {
        media.comments_analysis.comment_texts.forEach((comment) => {
          allComments.push({
            ...comment,
            media_id: media.id,
            media_caption: media.caption?.substring(0, 100) + '...' || 'Açıklama yok'
          });
        });
      }
    });

    if (allComments.length === 0) return <p>Henüz yorum bulunamadı</p>;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Toplam {allComments.length} Yorum</h4>
          <div className="text-sm text-gray-500">
            Ortalama uzunluk: {Math.round(allComments.reduce((sum, c) => sum + c.text.length, 0) / allComments.length)} karakter
          </div>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {allComments.map((comment, index) => (
            <div key={index} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-blue-600">@{comment.username}</div>
                <div className="text-xs text-gray-500">
                  ❤️ {comment.like_count} • {new Date(comment.timestamp).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div className="text-gray-700 mb-2">{comment.text}</div>
              <div className="text-xs text-gray-500 border-t pt-2">
                <strong>Medya:</strong> {comment.media_caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', render: renderOverview },
    { id: 'media', label: 'Medya', render: renderMedia },
    { id: 'comments', label: 'Yorumlar', render: renderComments },
    { id: 'demographics', label: 'Demografi', render: renderDemographics },
    { id: 'insights', label: 'Insights', render: renderInsights },
    { id: 'calculated', label: 'Hesaplanmış Metrikler', render: renderCalculatedMetrics },
  ];

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📸 Instagram Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm">Instagram hesabınız bağlı değil</p>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Instagram analizlerini görmek için önce hesabınızı bağlayın
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard?tab=connections'}
              size="sm"
            >
              Bağlantılarım'a Git
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📸 Instagram Analizi</span>
          <div className="flex space-x-2">
            <Button
              onClick={() => fetchInstagramData(activeTab)}
              disabled={loading}
              size="sm"
            >
              {loading ? 'Yükleniyor...' : 'Yükle'}
            </Button>
            <Button
              onClick={refreshData}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              Yenile
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <ErrorMessage message={error} />}
        
        <div className="mb-4">
          <div className="flex space-x-1 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  fetchInstagramData(tab.id);
                }}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            tabs.find(tab => tab.id === activeTab)?.render()
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramCard; 