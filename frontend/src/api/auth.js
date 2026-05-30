import api from './axios'
import axios from 'axios'

export const authApi = {
  register: (data) => api.post('/auth/register/', data),

  login: async (email, password) => {
    const { data } = await axios.post('/api/auth/login/', { email, password })
    return data
  },

  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),

  getProfile: () => api.get('/auth/profile/'),

  updateProfile: (formData) =>
    api.patch('/auth/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  changePassword: (data) => api.post('/auth/change-password/', data),

  setTheme: (theme) => api.patch('/auth/theme/', { theme }),
}
