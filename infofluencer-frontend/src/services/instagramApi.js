export async function getInstagramAuthUrl() {
  const token = localStorage.getItem('influencer_token');
  try {
    const res = await fetch('/api/influencer/instagram/connect/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      let errorText = await res.text();
      alert(`Instagram bağlantı URL alınamadı!\nStatus: ${res.status}\nResponse: ${errorText}`);
      throw new Error('Instagram bağlantı URL alınamadı');
    }
    const data = await res.json();
    return data.auth_url;
  } catch (err) {
    alert(`Instagram bağlantı başlatılamadı (JS Error): ${err.message}`);
    throw err;
  }
}

export async function getInstagramFullReport(access_token) {
  const token = localStorage.getItem('influencer_token');
  const res = await fetch('/api/influencer/instagram/full_report/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ access_token })
  });
  if (!res.ok) throw new Error('Instagram verileri alınamadı');
  return await res.json();
} 