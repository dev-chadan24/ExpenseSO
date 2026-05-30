// Centralized configuration layer for ExpenseSO
export const AUTH_BYPASS_MODE = import.meta.env.VITE_AUTH_BYPASS_MODE === 'true';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const DEFAULT_THEME = import.meta.env.VITE_DEFAULT_THEME || 'dark';

// Dummy user injected automatically when AUTH_BYPASS_MODE is active
export const DUMMY_USER = {
  id: 1,
  username: 'expenseso_demo',
  email: 'demo@expenseso.com',
  first_name: 'ExpenseSO',
  last_name: 'Demo Account',
  full_name: 'ExpenseSO Demo Account',
  profile: {
    currency: 'INR',
    monthly_budget: 150000.00, // Realistic Indian income/budget context
    phone: '+91 98765 43210',
    bio: 'ExpenseSO Demo Account — Engineered for Financial Excellence',
    theme_preference: 'dark',
    image: null
  }
};
