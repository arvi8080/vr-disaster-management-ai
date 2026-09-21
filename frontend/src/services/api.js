const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('firebaseIdToken');
  let res;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('fetch')) {
      throw new Error('Unable to connect to ResQVerse backend server (http://localhost:5000). Please verify the backend is running.');
    }
    throw err;
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API Request failed with status ${res.status}`);
  }

  return res.json();
}

export { API_BASE_URL };