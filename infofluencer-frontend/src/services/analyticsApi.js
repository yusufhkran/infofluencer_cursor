export async function checkConnections() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/company/analytics/connections/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function startGA4Auth() {
  const token = localStorage.getItem("access_token");
  console.log('GA4 AUTH TOKEN:', token);
  const response = await fetch("http://localhost:8000/api/company/auth/ga4/start/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await response.json();
  console.log('GA4 AUTH RESPONSE:', json);
  return json;
}

export async function startYouTubeAuth() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8000/api/company/auth/youtube/start/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function saveGA4PropertyId(propertyId) {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/company/auth/ga4/property/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ property_id: propertyId }),
  });
  return await response.json();
}

export async function getGA4ConnectionStatus() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8000/api/company/auth/ga4/connection/", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function disconnectGA4() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8000/api/company/auth/ga4/disconnect/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function getGA4PropertyId() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8000/api/company/auth/ga4/property/get/", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function disconnectYouTube() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8000/api/company/auth/youtube/disconnect/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function getYouTubeConnectionStatus() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8000/api/company/auth/youtube/connection/", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

// Instagram OAuth functions
export async function startInstagramAuth() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8000/api/company/auth/instagram/simple-connect/", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  // Gelen auth_url'ın içinde redirect_uri parametresi doğru mu kontrol et
  const data = await response.json();
  if (data.auth_url && !data.auth_url.includes("simple-callback")) {
    // Uyarı ver, yanlış endpoint dönüyor olabilir
    alert("Uyarı: Instagram bağlantı URL'inde simple-callback yok! Lütfen backend ayarlarını kontrol edin.");
  }
  return data;
}

export async function disconnectInstagram() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8000/api/company/auth/instagram/disconnect/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function getInstagramConnectionStatus() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("http://localhost:8000/api/company/auth/instagram/connection/", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function getInstagramAccountDetails() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/company/auth/instagram/account/", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function getInstagramPagesAndAccounts() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/company/auth/instagram/pages/", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function saveSelectedInstagramAccount({ page_id, instagram_account_id }) {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/company/auth/instagram/save/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_id, instagram_account_id })
  });
  return await response.json();
}

// Instagram Analytics API functions
export async function getInstagramBasicInfo() {
  const response = await fetch("/api/company/analytics/instagram/basic/", {
    credentials: "include",
  });
  const data = await response.json();
  // Eğer backend response'unda token yenilendi bilgisi varsa, onu da döndür
  return { ...data, _httpStatus: response.status };
}

export async function getInstagramMediaData() {
  const response = await fetch("/api/company/analytics/instagram/media/", {
    credentials: "include",
  });
  const data = await response.json();
  return { ...data, _httpStatus: response.status };
}

export async function getInstagramDemographics() {
  const response = await fetch("/api/company/analytics/instagram/demographics/", {
    credentials: "include",
  });
  const data = await response.json();
  return { ...data, _httpStatus: response.status };
}

export async function getInstagramInsights() {
  const response = await fetch("/api/company/analytics/instagram/insights/", {
    credentials: "include",
  });
  const data = await response.json();
  return { ...data, _httpStatus: response.status };
}

export async function getInstagramStories() {
  const response = await fetch("/api/company/analytics/instagram/stories/", {
    credentials: "include",
  });
  const data = await response.json();
  return { ...data, _httpStatus: response.status };
}

export async function getInstagramCalculatedMetrics() {
  const response = await fetch("/api/company/analytics/instagram/calculated/", {
    credentials: "include",
  });
  const data = await response.json();
  return { ...data, _httpStatus: response.status };
}

export async function refreshInstagramData() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/company/analytics/instagram/refresh/", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}
