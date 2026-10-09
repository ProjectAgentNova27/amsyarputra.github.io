# Portal Workers

Reviewed source for the existing Cloudflare Workers:

- `portal-status-api.js` -> existing `portal-status-api`
- `amsyar-markdown-agent.js` -> existing `amsyar-markdown-agent`

No credentials or bindings are stored here. Preserve each deployed Worker's
existing routes, bindings, secrets and Access settings. These are source snapshots,
not proof that production code matches. Reconcile any newer dashboard edits before
replacing deployed code. Deployment is separate from GitHub Pages.

9 October change: add public Document Studio with docs key and healthz probe; rename
Shlink management to Mini Links without changing its shlink key/URL; use shortener
healthz for short key. Both inventories agree. No timeout/concurrency/cache/auth
rewrite. Response bodies continue to be canceled after probes.

Focused check: `node cloudflare/test-services.cjs`.

Publish through the existing Cloudflare Worker Edit code workflow after reviewing
any newer deployed changes. Do not create new Workers or alter hostname routes.
After each deploy, verify status-api.amsyarputra.net/status.json includes docs and
the existing shlink/short entries, with Access reported Protected rather than
Offline. Verify the markdown agent's /docs/api and /.well-known/api-catalog include
Document Studio and Mini Links. No protected backend-health claim from Access alone.

Rollback: retain the prior Worker deployment/version and use Cloudflare rollback
for only the affected Worker. The website commit can be reverted separately.

Release state: source updated/tested and committed; Worker dashboard publication
remains pending. Never treat a Pages push as a Worker deploy.
