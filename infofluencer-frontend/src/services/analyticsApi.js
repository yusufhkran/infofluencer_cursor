export async function checkConnections() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/company/analytics/connections/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function startGA4Auth() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/company/auth/ga4/start/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}

export async function startYouTubeAuth() {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/company/auth/youtube/start/", {
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
