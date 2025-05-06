// Google Analytics measurement ID (replace with actual ID in production)
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Declare gtag as a property on the window object for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set', 
      targetId: string, 
      config?: Record<string, any> | undefined
    ) => void;
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Common events for Farm2Fork application
export const trackAddToCart = (product: { id: string; name: string; price: number; quantity: number }) => {
  event({
    action: 'add_to_cart',
    category: 'ecommerce',
    label: product.name,
    value: product.price * product.quantity,
  });
};

export const trackRemoveFromCart = (product: { id: string; name: string; price: number; quantity: number }) => {
  event({
    action: 'remove_from_cart',
    category: 'ecommerce',
    label: product.name,
    value: product.price * product.quantity,
  });
};

export const trackBeginCheckout = (cartValue: number) => {
  event({
    action: 'begin_checkout',
    category: 'ecommerce',
    value: cartValue,
  });
};

export const trackPurchase = (orderId: string, revenue: number) => {
  event({
    action: 'purchase',
    category: 'ecommerce',
    label: orderId,
    value: revenue,
  });
};

export const trackSignUp = (method: string) => {
  event({
    action: 'sign_up',
    category: 'engagement',
    label: method,
  });
};

export const trackLogin = (method: string) => {
  event({
    action: 'login',
    category: 'engagement',
    label: method,
  });
};

export const trackSearch = (query: string) => {
  event({
    action: 'search',
    category: 'engagement',
    label: query,
  });
};

export const trackFilterProducts = (filter: string) => {
  event({
    action: 'filter_products',
    category: 'engagement',
    label: filter,
  });
};