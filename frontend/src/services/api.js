const BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('drivex_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => request('/auth/password', { method: 'PUT', body: JSON.stringify(body) }),

  // Vehicles
  getVehicles: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vehicles?${q}`);
  },
  getVehicle: (id) => request(`/vehicles/${id}`),
  getMakes: () => request('/vehicles/makes'),
  getCategories: () => request('/vehicles/categories'),
  saveVehicle: (id) => request(`/vehicles/${id}/save`, { method: 'POST' }),
  getSavedVehicles: () => request('/vehicles/user/saved'),
  addReview: (id, body) => request(`/vehicles/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),

  // Purchases
  createPurchase: (body) => request('/purchases', { method: 'POST', body: JSON.stringify(body) }),
  getMyPurchases: () => request('/purchases/my'),
  cancelPurchase: (id) => request(`/purchases/${id}/cancel`, { method: 'PUT' }),

  // Sell
  submitSellCar: (body) => request('/sell', { method: 'POST', body: JSON.stringify(body) }),
  getMySellSubmissions: () => request('/sell/my'),

  // Offers
  makeOffer: (body) => request('/offers', { method: 'POST', body: JSON.stringify(body) }),
  getMyOffers: () => request('/offers/my'),
  respondToOffer: (id, body) => request(`/offers/${id}/respond`, { method: 'PUT', body: JSON.stringify(body) }),

  // Inquiries
  submitInquiry: (body) => request('/inquiries', { method: 'POST', body: JSON.stringify(body) }),

  // Stats
  getStats: () => request('/stats'),

  // Admin
  admin: {
    getStats: () => request('/admin/stats'),
    getVehicles: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/vehicles?${q}`); },
    addVehicle: (body) => request('/admin/vehicles', { method: 'POST', body: JSON.stringify(body) }),
    updateVehicle: (id, body) => request(`/admin/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteVehicle: (id) => request(`/admin/vehicles/${id}`, { method: 'DELETE' }),
    getPurchases: () => request('/admin/purchases'),
    updatePurchase: (id, body) => request(`/admin/purchases/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    getSellSubmissions: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/sell-submissions?${q}`); },
    updateSellSubmission: (id, body) => request(`/admin/sell-submissions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    getOffers: () => request('/admin/offers'),
    getUsers: () => request('/admin/users'),
    getInquiries: () => request('/admin/inquiries'),
  }
};
