// AccountInfo.js: Kullanıcı ve firma bilgileri ayarları

/**
 * AccountInfo componenti, kullanıcıya firma adı, yetkili kişi, pozisyon, e-posta, telefon, logo ve profil görseli güncelleme imkanı sunar.
 */
import React, { useEffect, useState } from 'react';
import { getAccountInfo, updateAccountInfo } from '../../services/settingsApi';

const AccountInfo = () => {
  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    position: '',
    phone: '',
    logo: '',
    profile_image: '',
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getAccountInfo()
      .then((res) => {
        if (res.success && res.data) setForm(res.data);
        else setError('Bilgiler alınamadı');
      })
      .catch(() => setError('Sunucu hatası'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    try {
      const res = await updateAccountInfo(form);
      if (res.success) setSuccess(true);
      else setError(res.error || 'Güncelleme başarısız');
    } catch {
      setError('Sunucu hatası');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h2>Hesap Bilgilerim</h2>
      <form onSubmit={handleSubmit}>
        <label>Firma Adı
          <input name="company_name" value={form.company_name} onChange={handleChange} />
        </label>
        <label>Yetkili Kişi
          <input name="contact_person" value={form.contact_person} onChange={handleChange} />
        </label>
        <label>Pozisyon
          <input name="position" value={form.position} onChange={handleChange} />
        </label>
        <label>Telefon
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        {/* Logo ve profil görseli için ayrı upload alanı eklenebilir */}
        <button type="submit">Kaydet</button>
        {success && <span style={{ color: 'green' }}>Başarıyla güncellendi</span>}
        {error && <span style={{ color: 'red' }}>{error}</span>}
      </form>
    </div>
  );
};

export default AccountInfo; 