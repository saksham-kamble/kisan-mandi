import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const requestOTP = (data) => api.post('/auth/request-otp', data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data);
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);

// Centres
export const getCentres = (district) => api.get('/centres', { params: { district } });
export const getCentre = (id) => api.get(`/centres/${id}`);
export const getCentreSlots = (centreId, date) =>
  api.get(`/centres/${centreId}/slots`, { params: { date } });

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/mine');
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);

// Queue
export const getLiveQueue = (centreId) => api.get(`/queue/${centreId}/live`);
export const getQueuePosition = (centreId, bookingId) =>
  api.get(`/queue/${centreId}/position/${bookingId}`);

// Payments
export const getMyPayments = () => api.get('/payments');
export const getPaymentStatus = (bookingId) => api.get(`/payments/${bookingId}`);

// MSP Rates Master
export const getMSPRates = () => api.get('/msp-rates');
export const getRateForCommodity = (commodity) => api.get(`/msp-rates/${commodity}`);

// J-Form Receipt
export const getJFormUrl = (bookingId) => {
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/jform/${bookingId}?token=${token}`;
};

// 7/12 Land Records & Quota
export const getMyLandRecords = () => api.get('/land-records');
export const getQuotaForCommodity = (commodity) => api.get(`/land-records/quota/${commodity}`);
export const addLandRecord = (data) => api.post('/land-records', data);
export const updateLandRecord = (id, data) => api.put(`/land-records/${id}`, data);
export const deleteLandRecord = (id) => api.delete(`/land-records/${id}`);

// Grievances & Helpdesk
export const createGrievance = (data) => api.post('/grievances', data);
export const getMyGrievances = () => api.get('/grievances/mine');
export const getAllGrievances = (params) => api.get('/grievances/admin', { params });
export const resolveGrievance = (id, data) => api.patch(`/grievances/${id}/resolve`, data);

// Mandi Announcements, Weather & Live Updates
export const getUpdates = (params) => api.get('/updates', { params });
export const createUpdate = (data) => api.post('/updates', data);
export const deleteUpdate = (id) => api.delete(`/updates/${id}`);

// Mandi Admin Operations
export const checkInBooking = (id) => api.patch(`/admin/bookings/${id}/check-in`);
export const startProcessing = (id) => api.patch(`/admin/bookings/${id}/start`);
export const completeBooking = (id, data) => api.patch(`/admin/bookings/${id}/complete`, data);
export const updatePayment = (id, data) => api.patch(`/admin/payments/${id}`, data);
export const getCentreStats = (centreId) => api.get(`/admin/centres/${centreId}/stats`);

// Super Admin (District Nodal Officer / APMC Director)
export const getSuperAdminStats = () => api.get('/super-admin/stats');
export const getSuperAdminMandiReports = (params) => api.get('/super-admin/mandi-reports', { params });
export const resolveSuperAdminGrievance = (id, data) => api.patch(`/super-admin/grievances/${id}`, data);
export const getCentresAudit = () => api.get('/super-admin/centres-audit');

export default api;
