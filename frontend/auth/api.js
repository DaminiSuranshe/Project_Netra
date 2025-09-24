// Base URL for backend
const API_BASE = "http://localhost:5000/api";

/**
 * Wrapper around fetch to automatically attach JWT token
 * @param {string} endpoint - API endpoint after /api/
 * @param {object} options - fetch options
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // Add default headers
  options.headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}/${endpoint}`, options);

  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || "API request failed");
  }

  return data;
}

// auth/api.js
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token"); // JWT token
  const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {})
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}
