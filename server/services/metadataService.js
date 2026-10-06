const axios = require('axios');
const cheerio = require('cheerio');
const dns = require('dns').promises;
const net = require('net');
const httpError = require('../utils/httpError');

const MAX_REDIRECTS = 4;

/* ---------- URL validation ---------- */

// Accepts "react.dev" or "https://react.dev/learn"; returns a normalised http(s) URL.
function normalizeUrl(input) {
  if (typeof input !== 'string' || !input.trim()) throw httpError(400, 'Please enter a URL.');
  let raw = input.trim();
  if (raw.length > 2048) throw httpError(400, 'That URL is too long.');
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw httpError(400, 'That does not look like a valid URL.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw httpError(400, 'Only http and https URLs are supported.');
  if (!parsed.hostname.includes('.') && !net.isIP(parsed.hostname)) throw httpError(400, 'That does not look like a valid URL.');
  if (parsed.username || parsed.password) throw httpError(400, 'URLs with embedded credentials are not allowed.');
  return parsed.href;
}

// Only allow http(s) image/icon URLs to be stored (blocks javascript: and data: URIs).
function safeAssetUrl(value) {
  if (!value || typeof value !== 'string') return '';
  try {
    const u = new URL(value);
    return ['http:', 'https:'].includes(u.protocol) && value.length <= 2048 ? u.href : '';
  } catch {
    return '';
  }
}

/* ---------- SSRF protection: never fetch private/internal addresses ---------- */

function isPrivateIPv4(ip) {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  const v6 = ip.toLowerCase();
  if (v6 === '::1' || v6 === '::') return true;
  if (v6.startsWith('::ffff:')) {
    const tail = v6.slice(7);
    return net.isIPv4(tail) ? isPrivateIPv4(tail) : true;
  }
  return /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6);
}

async function assertPublicHost(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw httpError(400, 'That address is not reachable from the server.');
  }
  const addresses = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => isPrivateIp(a.address))) {
    throw httpError(400, 'That address is not reachable from the server.');
  }
}

/* ---------- Fetching ---------- */

async function fetchHtml(startUrl) {
  let current = startUrl;
  for (let i = 0; i <= MAX_REDIRECTS; i += 1) {
    await assertPublicHost(new URL(current).hostname);
    const res = await axios.get(current, {
      timeout: 8000,
      maxRedirects: 0,
      maxContentLength: 2 * 1024 * 1024,
      responseType: 'text',
      transformResponse: (r) => r,
      validateStatus: (s) => s >= 200 && s < 400,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DeveloperVaultBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (res.status >= 300) {
      const location = res.headers.location;
      if (!location) throw new Error('Redirect without location');
      const next = new URL(location, current);
      if (!['http:', 'https:'].includes(next.protocol)) throw new Error('Unsafe redirect');
      current = next.href;
      continue;
    }
    if (!String(res.headers['content-type'] || '').includes('html')) return { html: '', finalUrl: current };
    return { html: res.data, finalUrl: current };
  }
  throw new Error('Too many redirects');
}

/* ---------- Parsing ---------- */

const clip = (s, n) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
const stripWww = (h) => h.replace(/^www\./, '');

function suggestType(hostname, pathname) {
  const h = stripWww(hostname);
  if (h === 'github.com' || h === 'gitlab.com') return 'GitHub Repository';
  if (/(^|\.)(youtube\.com|youtu\.be|vimeo\.com)$/.test(h)) return 'Video';
  if (/^(docs|developer|developers|devdocs)\./.test(h) || h.endsWith('.dev') || h === 'developer.mozilla.org' || /\/docs?(\/|$)/.test(pathname)) return 'Documentation';
  if (/(^|\.)(medium\.com|dev\.to|hashnode\.dev|substack\.com)$/.test(h)) return 'Article';
  if (/(udemy|coursera|freecodecamp|edx)\./.test(h)) return 'Course';
  return null;
}

function parseMetadata(html, finalUrl) {
  const $ = cheerio.load(html);
  const meta = (...names) => {
    for (const n of names) {
      const v = $(`meta[property="${n}"], meta[name="${n}"]`).first().attr('content');
      if (v && v.trim()) return v;
    }
    return '';
  };
  const resolve = (href) => {
    try { return safeAssetUrl(new URL(href, finalUrl).href); } catch { return ''; }
  };

  const iconEl = ['icon', 'shortcut icon', 'apple-touch-icon']
    .map((rel) => $(`link[rel="${rel}"]`).first().attr('href'))
    .find(Boolean);

  return {
    title: clip(meta('og:title', 'twitter:title') || $('title').first().text(), 200),
    description: clip(meta('og:description', 'twitter:description', 'description'), 500),
    siteName: clip(meta('og:site_name'), 100),
    previewImage: resolve(meta('og:image', 'twitter:image')),
    favicon: iconEl ? resolve(iconEl) : '',
  };
}

// Returns metadata for a URL. Unreachable sites still return a usable fallback.
async function getMetadata(input) {
  const url = normalizeUrl(input);
  const parsed = new URL(url);
  const host = stripWww(parsed.hostname);
  const fallback = {
    url,
    title: host,
    description: '',
    website: host,
    previewImage: '',
    favicon: `${parsed.origin}/favicon.ico`,
    suggestedType: suggestType(parsed.hostname, parsed.pathname),
    fetched: false,
  };

  try {
    await assertPublicHost(parsed.hostname); // throws 400 for private targets
  } catch (err) {
    if (err.expose) throw err;
    return fallback; // DNS failure -> site unreachable
  }

  try {
    const { html, finalUrl } = await fetchHtml(url);
    if (!html) return fallback;
    const m = parseMetadata(html, finalUrl);
    return {
      ...fallback,
      title: m.title || fallback.title,
      description: m.description,
      website: m.siteName || host,
      previewImage: m.previewImage,
      favicon: m.favicon || fallback.favicon,
      fetched: true,
    };
  } catch (err) {
    if (err.expose) throw err;
    return fallback;
  }
}

module.exports = { getMetadata, normalizeUrl, safeAssetUrl };
