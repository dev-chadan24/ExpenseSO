import api from './axios'

export const categoriesApi = {
  list:   ()       => api.get('/categories/'),
  create: (data)   => api.post('/categories/', data),
  update: (id, data) => api.patch(`/categories/${id}/`, data),
  delete: (id)     => api.delete(`/categories/${id}/`),
}
