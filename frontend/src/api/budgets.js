import api from './axios'

export const budgetsApi = {
  list:   (params) => api.get('/budgets/', { params }),
  create: (data)   => api.post('/budgets/', data),
  update: (id, data) => api.patch(`/budgets/${id}/`, data),
  delete: (id)     => api.delete(`/budgets/${id}/`),
}
