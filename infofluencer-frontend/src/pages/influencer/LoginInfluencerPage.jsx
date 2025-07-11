import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginInfluencer } from '../../services/auth';

const LoginInfluencerPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) {
      setError('Email ve şifre zorunludur.');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.');
      setLoading(false);
      return;
    }
    try {
      const data = await loginInfluencer(email, password);
      // localStorage.setItem('influencer_token', data.access); // Artık servis fonksiyonunda kaydediliyor
      navigate('/influencer/dashboard');
    } catch (err) {
      let msg = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      if (err.response && err.response.data) {
        const errors = err.response.data;
        if (typeof errors === 'string') {
          msg = errors;
        } else if (typeof errors === 'object') {
          msg = Object.entries(errors)
            .map(([field, val]) => `${field}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-500 relative overflow-hidden">
      {/* Dekoratif bloblar */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-400 opacity-30 rounded-full blur-3xl animate-pulse z-0"></div>
      <div className="absolute -bottom-40 right-0 w-96 h-96 bg-yellow-300 opacity-20 rounded-full blur-2xl animate-pulse z-0"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-fuchsia-400 opacity-20 rounded-full blur-2xl animate-pulse z-0" style={{transform: 'translate(-50%, -50%)'}}></div>
      {/* Sol panel (desktop) */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 pl-24 z-10">
        <h1 className="text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
          <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 bg-clip-text text-transparent">Influencer Giriş</span>
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-lg drop-shadow">
          Topluluğunu büyüt, markalarla buluş, <span className="font-semibold text-yellow-200">influence</span> etki alanını genişlet!
        </p>
        <div className="flex space-x-4 mt-4">
          <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition">
            <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04A4.28 4.28 0 0016.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.85 1.94 3.63-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.9 3.97 2.93A8.6 8.6 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.7 8.7 0 0024 4.59a8.48 8.48 0 01-2.54.7z"/></svg>
          </a>
          <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition">
            <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 3.6 8.07 8.24 8.93v-6.32h-2.48v-2.61h2.48V9.41c0-2.45 1.49-3.8 3.68-3.8 1.07 0 2.19.19 2.19.19v2.41h-1.24c-1.22 0-1.6.76-1.6 1.54v1.85h2.72l-.44 2.61h-2.28v6.32c4.64-.86 8.24-4.52 8.24-8.93 0-5.5-4.46-9.96-9.96-9.96z"/></svg>
          </a>
          <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35 11.1c.04.28.04.56.04.84 0 8.62-6.56 18.56-18.56 18.56-3.7 0-7.16-1.08-10.08-2.94.52.06 1.04.08 1.58.08 3.08 0 5.92-1.04 8.18-2.8-2.88-.06-5.3-1.96-6.14-4.58.4.06.8.1 1.22.1.58 0 1.14-.08 1.68-.22-3.02-.6-5.3-3.28-5.3-6.48v-.08c.88.48 1.88.78 2.94.82-1.76-1.18-2.92-3.18-2.92-5.46 0-1.2.32-2.32.88-3.28 3.2 3.92 8 6.48 13.38 6.76-.1-.48-.16-.98-.16-1.5 0-3.6 2.92-6.52 6.52-6.52 1.88 0 3.58.8 4.78 2.08 1.48-.28 2.88-.84 4.14-1.6-.48 1.5-1.5 2.76-2.84 3.56 1.32-.16 2.6-.5 3.78-1.02-.88 1.32-2 2.48-3.28 3.4z"/></svg>
          </a>
        </div>
      </div>
      {/* Sağ panel (form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl p-10 relative backdrop-blur-md border border-white/40">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Influencer Logo" className="w-16 h-16 mx-auto mb-3 rounded-2xl shadow-lg border border-gray-100 bg-white" />
            <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">Influencer Giriş</h2>
            <p className="text-gray-500">Hoş geldin! Lütfen hesabınla giriş yap.</p>
          </div>
          {error && <div className="mb-4 text-red-600 text-sm text-center font-medium">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Şifre</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 text-white font-bold text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm">
            Hesabınız yok mu?{' '}
            <Link to="/influencer/register" className="text-pink-600 hover:underline font-semibold">Kayıt Ol</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginInfluencerPage; 