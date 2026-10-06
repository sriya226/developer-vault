// Removes Mongo operator keys ($ne, a.b) and HTML tags from user input.
const RAW_KEYS = new Set(['password', 'confirmPassword']);

const clean = (value, key) => {
  if (typeof value === 'string') {
    if (RAW_KEYS.has(key)) return value;
    return value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  }
  if (Array.isArray(value)) return value.map((v) => clean(v, key));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$') || k.includes('.')) continue;
      out[k] = clean(v, k);
    }
    return out;
  }
  return value;
};

module.exports = (req, _res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.query) req.query = clean(req.query);
  next();
};
