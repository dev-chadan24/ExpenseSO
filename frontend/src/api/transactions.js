import api from './axios'

export const transactionsApi = {
  list:   (params) => api.get('/transactions/', { params }),
  get:    (id)     => api.get(`/transactions/${id}/`),
  create: (data)   => api.post('/transactions/', data),
  update: (id, data) => api.patch(`/transactions/${id}/`, data),
  delete: (id)     => api.delete(`/transactions/${id}/`),
  summary: ()      => api.get('/transactions/summary/'),
}
