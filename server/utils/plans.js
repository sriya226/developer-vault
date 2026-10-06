// Single source of truth for plan limits (enforced on the server).
// null = unlimited. "Unlimited" values still have a hard safety cap to protect the database.
const DAY_MS = 24 * 60 * 60 * 1000;
const PLAN_DURATION_DAYS = 30;
const HARD_MAX_TAGS = 100;
const HARD_MAX_CUSTOM_CATEGORIES = 100;

const PLANS = {
  free: { id: 'free', name: 'Free', price: 0, limits: { maxResources: 25, maxTagsPerResource: 3, maxCustomCategories: 0 } },
  // price is in paise (INR x 100): 19900 = Rs 199
  pro: { id: 'pro', name: 'Pro', price: 19900, limits: { maxResources: 500, maxTagsPerResource: null, maxCustomCategories: null } },
  team: { id: 'team', name: 'Team', price: 49900, limits: { maxResources: null, maxTagsPerResource: null, maxCustomCategories: null } },
};

// A paid plan only counts while it has not expired; otherwise the user is on Free.
const effectivePlanId = (user) =>
  user.plan && user.plan !== 'free' && PLANS[user.plan] && user.planExpiresAt && new Date(user.planExpiresAt) > new Date()
    ? user.plan
    : 'free';

const limitsFor = (user) => PLANS[effectivePlanId(user)].limits;
const planNameFor = (user) => PLANS[effectivePlanId(user)].name;

module.exports = { PLANS, DAY_MS, PLAN_DURATION_DAYS, HARD_MAX_TAGS, HARD_MAX_CUSTOM_CATEGORIES, effectivePlanId, limitsFor, planNameFor };
