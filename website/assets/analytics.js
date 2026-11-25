// Anonymous page counts; never send the URL, query string or a user identifier.
(() => {
  if (location.hostname !== "bloom.webkubor.online" || navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  try {
    if (localStorage.getItem('bloom-analytics') === 'off' || localStorage.getItem('core-analytics') === 'off') return;
    void fetch("https://api.webkubor.online/v1/analytics/events", {
      method: 'POST', credentials: 'omit', keepalive: true,
      signal: AbortSignal.timeout(3000),
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ project: 'bloom', event_id: crypto.randomUUID(), event: 'page.view', properties: {} }),
    }).catch(() => {});
  } catch { /* Measurement must never interrupt browsing. */ }
})();
