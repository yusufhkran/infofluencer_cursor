// BillingInfo.js: Fatura ve ödeme bilgileri

/**
 * BillingInfo componenti, kullanıcıya aktif plan, kredi kartı, fatura geçmişi ve otomatik ödeme ayarlarını gösterir.
 */
import React, { useEffect, useState } from 'react';
import { getBillingInfo, updateBillingInfo } from '../../services/settingsApi';

const BillingInfo = () => {
  const [form, setForm] = useState({
    active_plan: 'free',
    card_last4: '',
    auto_renew: true,
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getBillingInfo()
      .then((res) => {
        if (res.success && res.data) setForm(res.data);
        else setError('Bilgiler alınamadı');
      })
      .catch(() => setError('Sunucu hatası'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    try {
      const res = await updateBillingInfo(form);
      if (res.success) setSuccess(true);
      else setError(res.error || 'Güncelleme başarısız');
    } catch {
      setError('Sunucu hatası');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h2>Fatura ve Ödeme</h2>
      <form onSubmit={handleSubmit}>
        <label>Aktif Plan
          <select name="active_plan" value={form.active_plan} onChange={handleChange}>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
          </select>
        </label>
        <label>Kredi Kartı Son 4 Hane
          <input name="card_last4" value={form.card_last4} onChange={handleChange} maxLength={4} />
        </label>
        <label>
          <input type="checkbox" name="auto_renew" checked={form.auto_renew} onChange={handleChange} />
          Otomatik Yenileme
        </label>
        <button type="submit">Kaydet</button>
        {success && <span style={{ color: 'green' }}>Başarıyla güncellendi</span>}
        {error && <span style={{ color: 'red' }}>{error}</span>}
      </form>
    </div>
  );
};

export default BillingInfo; 