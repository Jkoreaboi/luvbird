// Build-time validation only; never imports server credentials into the app.
function isReleaseOrigin(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return false;
    // Require a DNS name, rejecting IP literals and reserved example/local names.
    if (!host.includes('.') || host.includes(':') || /^[\d.]+$/.test(host)) return false;
    if (!host.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) return false;
    if (/(^|\.)(localhost|example|invalid|test|local|internal)$/.test(host)) return false;
    return !/(^|\.)example\.(com|net|org)$/.test(host);
  } catch { return false; }
}
module.exports = { isReleaseOrigin };
