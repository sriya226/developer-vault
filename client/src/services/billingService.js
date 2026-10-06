import api from './api';

export const getBillingStatus = () => api.get('/billing/status').then((r) => r.data.data);
export const createOrder = (plan) => api.post('/billing/order', { plan }).then((r) => r.data.data);
export const verifyPayment = (payload) => api.post('/billing/verify', payload).then((r) => r.data.data.user);

// Loads Razorpay's checkout script on demand.
export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
