export async function login(email, password, userType = "company") {
  const response = await fetch("/api/accounts/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, userType }),
  });
  return await response.json();
}

export async function register(registerData) {
  const response = await fetch("/api/accounts/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
  });
  return await response.json();
}
