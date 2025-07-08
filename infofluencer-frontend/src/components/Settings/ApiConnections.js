// ApiConnections.js: API bağlantı yönetimi (GA4, YouTube, Instagram)

/**
 * ApiConnections componenti, kullanıcıya GA4, YouTube ve Instagram hesaplarını bağlama, bağlantı durumunu görme ve bağlantı kesme imkanı sunar.
 */
import React, { useEffect, useState } from 'react';
import { getApiConnections, updateApiConnection } from '../../services/settingsApi';

const PROVIDERS = [
  { key: 'ga4', label: 'Google Analytics 4' },
  { key: 'youtube', label: 'YouTube Data API' },
  { key: 'instagram', label: 'Instagram Graph API' },
];

const ApiConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getApiConnections()
      .then((res) => {
        if (res.success && res.data) setConnections(res.data);
        else setError('Bağlantılar alınamadı');
      })
      .catch(() => setError('Sunucu hatası'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (provider) => {
    setSuccess(false);
    setError('');
    try {
      const current = connections.find((c) => c.provider === provider);
      const res = await updateApiConnection({ provider, is_active: !current?.is_active });
      if (res.success) {
        setConnections((prev) =>
          prev.map((c) =>
            c.provider === provider ? { ...c, is_active: !c.is_active } : c
          )
        );
        setSuccess(true);
      } else setError(res.error || 'Güncelleme başarısız');
    } catch {
      setError('Sunucu hatası');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h2>API Bağlantıları</h2>
      <ul>
        {PROVIDERS.map((p) => {
          const conn = connections.find((c) => c.provider === p.key);
          return (
            <li key={p.key}>
              <span>{p.label}</span>
              <button onClick={() => handleToggle(p.key)}>
                {conn?.is_active ? 'Bağlantıyı Kes' : 'Bağla'}
              </button>
              {conn && conn.is_active && <span style={{ color: 'green' }}>Bağlı</span>}
            </li>
          );
        })}
      </ul>
      {success && <span style={{ color: 'green' }}>Başarıyla güncellendi</span>}
      {error && <span style={{ color: 'red' }}>{error}</span>}
    </div>
  );
};

export default ApiConnections; 