import api from './api';

export const register = (data) => api.post('/auth/register', data).then((r) => r.data);
export const login = (data) => api.post('/auth/login', data).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const updateProfile = (data) => api.patch('/auth/me', data).then((r) => r.data);
export const changePassword = (data) => api.patch('/auth/change-password', data).then((r) => r.data);
