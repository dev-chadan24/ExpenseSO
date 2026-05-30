import api from './axios'

export const reportsApi = {
  get:       (params) => api.get('/reports/', { params }),
  analytics: (params) => api.get('/analytics/', { params }),
  exportCsv: (params) => api.get('/export/csv/', { params, responseType: 'blob' }),
}
