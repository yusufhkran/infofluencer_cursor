// NotificationPreferences.js: Bildirim tercihleri ayarları

/**
 * NotificationPreferences componenti, kullanıcıya e-posta ve push bildirim tercihlerini yönetme imkanı sunar.
 */
import React, { useEffect, useState } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from '../../services/settingsApi';

const NotificationPreferences = () => {
  const [form, setForm] = useState({
    email_reports: true,
    campaign_end: true,
    integration_error: true,
    push_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getNotificationPreferences()
      .then((res) => {
        if (res.success && res.data) setForm(res.data);
        else setError('Tercihler alınamadı');
      })
      .catch(() => setError('Sunucu hatası'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, checked, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    try {
      const res = await updateNotificationPreferences(form);
      if (res.success) setSuccess(true);
      else setError(res.error || 'Güncelleme başarısız');
    } catch {
      setError('Sunucu hatası');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h2>Bildirim Tercihleri</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <input type="checkbox" name="email_reports" checked={form.email_reports} onChange={handleChange} />
          E-posta ile yeni rapor bildirimi
        </label>
        <label>
          <input type="checkbox" name="campaign_end" checked={form.campaign_end} onChange={handleChange} />
          Kampanya bitiş bildirimi
        </label>
        <label>
          <input type="checkbox" name="integration_error" checked={form.integration_error} onChange={handleChange} />
          Entegrasyon hatası bildirimi
        </label>
        <label>
          <input type="checkbox" name="push_enabled" checked={form.push_enabled} onChange={handleChange} />
          Push bildirimleri
        </label>
        <button type="submit">Kaydet</button>
        {success && <span style={{ color: 'green' }}>Başarıyla güncellendi</span>}
        {error && <span style={{ color: 'red' }}>{error}</span>}
      </form>
    </div>
  );
};

export default NotificationPreferences; 