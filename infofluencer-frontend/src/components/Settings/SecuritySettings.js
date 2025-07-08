// SecuritySettings.js: Güvenlik ve şifre ayarları

/**
 * SecuritySettings componenti, kullanıcıya şifre güncelleme, 2FA ve giriş geçmişi yönetimi imkanı sunar.
 */
import React, { useEffect, useState } from 'react';
import { getSecuritySettings, updateSecuritySettings } from '../../services/settingsApi';

const SecuritySettings = () => {
  const [form, setForm] = useState({
    two_factor_enabled: false,
    last_password_change: '',
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getSecuritySettings()
      .then((res) => {
        if (res.success && res.data) setForm(res.data);
        else setError('Ayarlar alınamadı');
      })
      .catch(() => setError('Sunucu hatası'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    try {
      const res = await updateSecuritySettings({ two_factor_enabled: form.two_factor_enabled });
      if (res.success) setSuccess(true);
      else setError(res.error || 'Güncelleme başarısız');
    } catch {
      setError('Sunucu hatası');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h2>Güvenlik ve Şifre</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <input type="checkbox" name="two_factor_enabled" checked={form.two_factor_enabled} onChange={handleChange} />
          2FA (İki Faktörlü Doğrulama)
        </label>
        <div>Son şifre değişimi: {form.last_password_change ? new Date(form.last_password_change).toLocaleString() : '-'}</div>
        <button type="submit">Kaydet</button>
        {success && <span style={{ color: 'green' }}>Başarıyla güncellendi</span>}
        {error && <span style={{ color: 'red' }}>{error}</span>}
      </form>
    </div>
  );
};

export default SecuritySettings; 