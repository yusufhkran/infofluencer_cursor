const API_BASE_URL = "http://localhost:8000";

export async function login(email, password, userType = "company") {
  const response = await fetch(`${API_BASE_URL}/api/auth/company_login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, user_type: userType }),
  });
  const data = await response.json();
  if (response.ok && data.access && data.refresh) {
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    if (data.user) {
      localStorage.setItem("user_data", JSON.stringify(data.user));
    }
    return { success: true, data };
  } else {
    return { success: false, message: data.detail || "Login failed" };
  }
}

export async function register(registerData) {
  const response = await fetch(`${API_BASE_URL}/api/auth/company_register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
  });
  return await response.json();
}

export function checkAndHandleJWTToken() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    // Kullanıcıyı logout et
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    // Eğer bir router varsa, login sayfasına yönlendirilebilir
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  return true;
}
