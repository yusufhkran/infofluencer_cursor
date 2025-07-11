import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export async function loginInfluencer(email, password) {
  const response = await axios.post(`${API_BASE_URL}/api/influencer/login/`, {
    email,
    password,
  });
  localStorage.setItem('influencer_token', response.data.access);
  return response.data;
}

export async function registerInfluencer({ name, surname, email, password }) {
  const response = await axios.post(`${API_BASE_URL}/api/influencer/register/`, {
    name,
    surname,
    email,
    password,
  });
  localStorage.setItem('influencer_token', response.data.access);
  return response.data;
} 