// settingsApi.js: Backend ayar endpointleriyle iletişim için servis fonksiyonları

/**
 * Her ayar paneli için GET ve POST fonksiyonları içerir.
 * - getAccountInfo / updateAccountInfo
 * - getApiConnections / updateApiConnection
 * - getNotificationPreferences / updateNotificationPreferences
 * - getSecuritySettings / updateSecuritySettings
 * - getBillingInfo / updateBillingInfo
 */

const API_BASE = 'http://127.0.0.1:8000/api/company/settings';

export async function getAccountInfo() {
  const res = await fetch(`${API_BASE}/account/`, { credentials: 'include' });
  return res.json();
}
export async function updateAccountInfo(data) {
  const res = await fetch(`${API_BASE}/account/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getApiConnections() {
  const res = await fetch(`${API_BASE}/api-connections/`, { credentials: 'include' });
  return res.json();
}
export async function updateApiConnection(data) {
  const res = await fetch(`${API_BASE}/api-connections/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getNotificationPreferences() {
  const res = await fetch(`${API_BASE}/notifications/`, { credentials: 'include' });
  return res.json();
}
export async function updateNotificationPreferences(data) {
  const res = await fetch(`${API_BASE}/notifications/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getSecuritySettings() {
  const res = await fetch(`${API_BASE}/security/`, { credentials: 'include' });
  return res.json();
}
export async function updateSecuritySettings(data) {
  const res = await fetch(`${API_BASE}/security/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getBillingInfo() {
  const res = await fetch(`${API_BASE}/billing/`, { credentials: 'include' });
  return res.json();
}
export async function updateBillingInfo(data) {
  const res = await fetch(`${API_BASE}/billing/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return res.json();
} 