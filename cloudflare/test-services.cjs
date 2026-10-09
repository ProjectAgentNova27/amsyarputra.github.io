const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function load(file) {
  const context = vm.createContext({URL, Response, Request, Headers, AbortController,
    setTimeout, clearTimeout, console});
  const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
  vm.runInContext(source.replace('export default {', 'globalThis.worker = {'), context);
  return context;
}

(async () => {
  const status = load('portal-status-api.js');
  const markdown = load('amsyar-markdown-agent.js');
  const inventory = context => JSON.parse(vm.runInContext('JSON.stringify(SERVICES)', context));
  const services = inventory(status);
  assert.deepEqual(services, inventory(markdown));
  assert.equal(new Set(services.map(s => s.key)).size, services.length);
  const docs = services.find(s => s.key === 'docs');
  assert.equal(docs.healthUrl, 'https://docs.amsyarputra.net/healthz');
  assert.equal(docs.access, 'public');
  assert.equal(services.find(s => s.key === 'shlink').name, 'Mini Links');
  assert.equal(services.find(s => s.key === 'shlink').access, 'cloudflare-access');
  const short = services.find(s => s.key === 'short');
  assert.equal(short.healthUrl, 'https://s.amsyarputra.net/healthz');
  for (const key of ['docs', 'short']) {
    let canceled = false;
    status.fetch = async url => {
      assert.equal(url, services.find(s => s.key === key).healthUrl);
      return {status: 200, headers: new Headers(), body: {cancel: async () => { canceled = true; }}};
    };
    const result = await vm.runInContext(`checkService(SERVICES.find(s => s.key === '${key}'), {}, new Date().toISOString())`, status);
    assert.equal(result.status, 'online');
    assert.equal(canceled, true);
  }
  assert.match(vm.runInContext('homepageMarkdown()', markdown), /Document Studio/);
  const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../.well-known/api-catalog.json')));
  assert(catalog.linkset[0].item.some(s => s.href === docs.url));
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.match(html, /data-status-key="docs"/);
  assert.match(html, /data-service="shlink"/);
  assert.match(html, /<h3>Mini Links<\/h3>/);
  console.log('PASS: matching inventories, docs/short health probes/body disposal, unchanged protected admin key, static discovery/listings');
})().catch(error => {console.error(error); process.exitCode = 1;});
