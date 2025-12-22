// Credit calculation utilities for AI generation features

export const CREDIT_COSTS = {
  'face-swap': {
    model: 'video-face-swap-pro',
    costPerSecond: 10,
    type: 'video',
    displayName: 'Face Swap Video'
  },
  'text-to-image': {
    model: 'z-image-turbo',
    costPerImage: 5,
    type: 'image',
    displayName: 'Text to Image'
  },
  'text-to-video': {
    model: 'doubao-seedance-1.0-pro-fast',
    costPerSecond: 10,
    type: 'video',
    displayName: 'Text to Video'
  },
  'image-to-video': {
    model: 'doubao-seedance-1.0-pro-fast',
    costPerSecond: 10,
    type: 'video',
    displayName: 'Image to Video'
  }
};

export const DAILY_FREE_CREDITS = 100;
export const INITIAL_BONUS_CREDITS = 100; // 新用户初始赠送

// 订阅套餐
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    priceLabel: '$0',
    description: 'Free for daily use',
    dailyCredits: 100,
    monthlyCredits: 0,
    features: [
      '100 daily credits',
      '100 initial extra credits'
    ],
    badge: null
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 4.99,
    priceLabel: '$4.99',
    period: '/month',
    description: 'Auto-renews monthly',
    dailyCredits: 100,
    monthlyCredits: 1200,
    features: [
      'Everything in Free plan',
      'Additional 1200 monthly credits',
      'Premium model',
      'Watermark-free downloads'
    ],
    badge: null
  },
  ultra: {
    id: 'ultra',
    name: 'Ultra Plan',
    price: 14.99,
    priceLabel: '$14.99',
    period: '/month',
    description: 'Auto-renews monthly',
    dailyCredits: 100,
    monthlyCredits: 4000,
    features: [
      'Everything in Free plan',
      'Additional 4000 monthly credits',
      'Premium model',
      'Watermark-free downloads'
    ],
    badge: null
  },
  max: {
    id: 'max',
    name: 'Max Plan',
    price: 44.99,
    priceLabel: '$44.99',
    period: '/month',
    description: 'Auto-renews monthly',
    dailyCredits: 100,
    monthlyCredits: 13000,
    features: [
      'Everything in Free plan',
      'Additional 13000 monthly credits',
      'Premium model',
      'Watermark-free downloads'
    ],
    badge: 'Best Value'
  }
};

// Calculate credits cost for a given action
export function calculateCost(action, params = {}) {
  const rule = CREDIT_COSTS[action];
  if (!rule) {
    console.warn(`Unknown action: ${action}`);
    return 0;
  }

  if (rule.type === 'video') {
    const duration = Math.ceil(params.duration || 0);
    return duration * rule.costPerSecond;
  }

  if (rule.type === 'image') {
    const count = params.count || 1;
    return count * rule.costPerImage;
  }

  return 0;
}

// Get display name for action
export function getActionDisplayName(action) {
  return CREDIT_COSTS[action]?.displayName || action;
}

// Format time until reset (HH:MM:SS)
export function formatTimeUntilReset() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));

  const diff = tomorrow - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Get today's date in UTC (YYYY-MM-DD)
export function getTodayUTC() {
  return new Date().toISOString().split('T')[0];
}
