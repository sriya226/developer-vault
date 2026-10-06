export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export const hostnameOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
};

export const parseTags = (input, max = 100) =>
  [...new Set(String(input || '').split(',').map((t) => t.trim().toLowerCase().replace(/^#+/, '')).filter(Boolean))].slice(0, max);

export const isProbablyUrl = (value) => {
  const v = value.trim();
  if (v.length < 4) return false;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`);
    return ['http:', 'https:'].includes(u.protocol) && u.hostname.includes('.') && !/\.$/.test(u.hostname) && u.hostname.split('.').pop().length >= 2;
  } catch { return false; }
};

export const downloadBlob = (blob, filename) => {
  const href = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
};
