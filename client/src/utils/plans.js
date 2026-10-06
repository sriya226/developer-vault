// Display data for the pricing UI. The server (server/utils/plans.js) is what actually enforces limits and prices.
export const PLAN_LIST = [
  { id: 'free', name: 'Free', price: 0, tagline: 'To get started', features: ['Up to 25 resources', '3 tags per resource', 'Built-in categories', 'Search, filters and favorites', 'JSON export'] },
  { id: 'pro', name: 'Pro', price: 199, tagline: 'For active learners', popular: true, features: ['Up to 500 resources', 'Unlimited tags', 'Unlimited custom categories', 'Everything in Free'] },
  { id: 'team', name: 'Team', price: 499, tagline: 'For power users', features: ['Unlimited resources', 'Unlimited tags', 'Unlimited custom categories', 'Everything in Pro'] },
];
export const PLAN_RANK = { free: 0, pro: 1, team: 2 };
export const PLAN_DAYS = 30;
