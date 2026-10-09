# Portal release follow-through

After every Mini Hosting service addition/update, review this website's listings,
status keys, discovery catalog, both Cloudflare Worker inventories, and relevant
documentation. Update where needed, run focused checks and commit/push relevant
changes. Never include credentials, private backups, document data or unrelated edits.

Use cloudflare/ sources for reviewed Worker changes, reconciling any newer deployed
edits before replacement. Pages pushes do not deploy Workers; verify both separately
and report manual deployment remaining. Missing status data stays Unknown.
Preserve service hostname/status keys unless migration explicitly requires changes.
Main-domain sitemap/robots do not govern separate service subdomains. Do not change
Access/DNS/Tunnel routes merely to make a status probe pass.

All Mini Hosting services require appropriate owner-controlled lowercase ap.
co-branding. Read the private docs/branding.md canonical policy and local
assets/brand/README.md artwork reference. Preserve vendor marks and approved geometry;
exceptions/runtime adoption need owner approval. Do not mass-deploy for branding.

Homelab infrastructure changes require its live AGENTS.md and maintenance SOP.
Never touch Technitium; retain legacy resources until separate retirement approval.
