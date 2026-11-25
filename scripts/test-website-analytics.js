const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('website/assets/analytics.js', 'utf8');
const hostname = new URL(require('../package.json').homepage).hostname;
function run(overrides = {}) {
  const requests = [];
  vm.runInNewContext(source, {
    location: { hostname }, navigator: {},
    localStorage: { getItem: () => null }, crypto: { randomUUID: () => 'test-event' },
    AbortSignal, fetch: (...args) => { requests.push(args); return Promise.resolve(); },
    ...overrides,
  });
  return requests;
}
const requests = run();
assert.equal(requests.length, 1);
const [url, options] = requests[0];
assert.equal(new URL(url).pathname, '/v1/analytics/events');
assert.deepEqual(JSON.parse(options.body), {
  project: 'bloom', event_id: 'test-event', event: 'page.view', properties: {},
});
assert.equal(options.credentials, 'omit');
assert.ok(options.signal instanceof AbortSignal);
for (const hostname of ['localhost', 'preview.pages.dev']) assert.equal(run({ location: { hostname } }).length, 0);
assert.equal(run({ navigator: { doNotTrack: '1' } }).length, 0);
assert.equal(run({ navigator: { globalPrivacyControl: true } }).length, 0);
for (const key of ['bloom-analytics', 'core-analytics']) {
  assert.equal(run({ localStorage: { getItem: name => name === key ? 'off' : null } }).length, 0);
}
assert.equal(run({ localStorage: { getItem: () => { throw Error('Unavailable'); } } }).length, 0);
run({ fetch: () => Promise.reject(Error('Offline')) });
for (const page of ['index', 'install', 'palettes']) {
  const html = fs.readFileSync(`_pages/${page}.html`, 'utf8');
  assert.equal((html.match(/src="assets\/analytics.js"/g) || []).length, 1);
  assert.ok(!html.includes('umami'));
}
assert.ok(!fs.readFileSync('website/site.js', 'utf8').includes('umami'));
console.log('Website analytics: payload, production/privacy guards, failures and all 3 pages passed.');
