# Technology portal redesign - approved source release

Checkpoint: 9 October 2026, Asia/Singapore. Base website commit6514060. Public
source was clean and matched origin/main at preflight. The owner explicitly approved
publication on 9 October 2026. This source release requires separate Pages build and
live-site verification, recorded in the private operations documentation.
No Docker lifecycle operations, maintenance flags, Access/routing/DNS changes or
Worker deployment. This redesign is independent of infrastructure deployments.

## Architecture and design

Keep static HTML/CSS/JS and the existing GitHub Pages workflow: no framework,
mandatory build, backend, container, analytics or runtime third-party scripts.
The premium charcoal/cyan identity uses local Inter variable typography, generated
editorial technology artwork and a small static Lucide symbol sprite. The artwork
is conceptual, not an application screenshot or representation of actual hardware.
Hero, asymmetrical four-app feature grid, searchable21-destination directory,
everyday links, contact/footer and shared supporting-page navigation form one system.

- style/site.css: centralized dark/light tokens, fixed responsive type sizes,
  accessible focus, restrained motion, safe touch targets and reduced-motion rules.
- script/theme.js: blocking first-paint bootstrap; system appearance initially,
  cycling Light/Dark/System, optional localStorage portal-theme preference.
- script/main.js: minute-scale visible clock, timezone, menu, filters, search,
  dialog palette, slash/Cmd-or-Ctrl-K shortcuts and keyboard/focus handling.
- script/status.js: unchanged status endpoint/keys, array/keyed contract support,
  eight-second deadline, failed-body cancellation and Unknown fallback.
- script/status-page.js: counts/refresh; Protected never becomes backend health.
  Missing keys stay visible as Unknown. Static status links also work without JS.

Homepage links exist in HTML, not fetched/rendered as a prerequisite. Search is
ephemeral, no account or server state. Dialog unsupported: focus directory search.
Without JS, destinations/navigation remain and status stays Unknown; appearance
uses CSS system preference. No global zoom restriction.

## Preserved contracts

All original homepage destinations/status keys and protected/public distinctions,
contacts/social/external links retained. Source discovery catalog, machine endpoints,
Worker sources, robots, sitemap, security files, OPML, CNAME and favicon unchanged.
Canonical/OG/Twitter links preserved; existing OG image retained. VPN noindex/nofollow
and moonlight-sunshine fragment retained. Privacy/VPN explanations preserved; privacy
adds appearance storage and Document Studio's local/evictable browser storage.
404 now shares the visual system. Legacy Font Awesome CDN removed from these pages.
Worker inventory/contract unchanged, so no new Worker publication needed for design.
Previously deferred Worker deployment remains a separate historical unknown.

## Assets and dependencies

InterVariable.woff2 from rsms/inter with bundled SIL OFL license (assets/fonts).
Lucide1.8.0 from the available development package;36 selected icon definitions
and ISC license vendored in assets/. No icon runtime library shipped. The developer
sprite helper is tests/vendor-assets.cjs; it requires an explicitly reviewed Lucide
package via LUCIDE_ROOT, not installation or an application build.
portal-hero.webp:1600x900,157174bytes. Font: approximately344KiB. Core browser JS,
CSS and icon sprite are small standalone files; exact byte totals are measurable
locally. No benchmark, Lighthouse score or complete WCAG certification claimed.
Font swap has a system fallback; image dimensions and grid tracks reserve layout.
CSS/JS URLs share a static release token to prevent mixed cached asset versions.
Bump it consistently across the five HTML pages when changing these assets. Fresh
versioned preview verified Escape closes mobile navigation and restores focus.

## Preview and verification

From this checkout: `python3 -B -m http.server 8777 --bind 127.0.0.1`.
Open http://localhost:8777. Serve only the public checkout, never its parent.
This is a loopback development preview, not production publishing.

Passed:

- node cloudflare/test-services.cjs: inventory equality, docs/short probes/body
  disposal, stable protected admin key and discovery/listing checks. Updated its
  obsolete span-specific assertion to the new heading/stable service identity.
- node tests/status-contract.cjs: array/keyed status, Protected-not-healthy,
  missing/error Unknown, failed body disposal, original links/keys and JS syntax.
- In-app browser: dark/light appearance and reload persistence, category/search
  empty/clear flow, palette result/arrow/Escape navigation, responsive menu,
  320/390/768/1440px layout without horizontal overflow or measured text clipping.
  Secondary pages, VPN fragment/noindex, actual unavailable-API fallback/refresh
  and captured console review passed. Local API unavailable; not proof of WAN health.
- Diff whitespace and source preservation checks.

Headless Playwright tests/portal-preview.cjs is provided but did not run: installed
Chrome launch was blocked by the local execution sandbox. Browser assets were not
installed, and no security boundary was bypassed. Use a permitted environment with
Playwright and SCREENSHOT_DIR outside this publishing tree to run it later.
Full mocked browser/no-JS/reduced-motion suite, physical iOS/Android/Safari devices,
screen reader acceptance and full contrast audit remain unverified. Static no-JS/
reduced-motion rules and keyboard semantics exist but are not a certification.
Screenshots are development evidence outside the publishing tree, not bundled assets.

## Production gate and rollback

Owner approval was obtained after local preview. Review working-tree changes,
commit only the portal's reviewed files, follow the existing Pages release procedure
and separately verify publication. Do not infer publication from commit/push alone.
Check service destinations, status/CORS on the production origin and both themes
after release. Do not weaken Access or invent Online results to pass checks.
Update the private website guide/current-state/changelog after the approved release.
No material build/deployment architecture or operational SOP migration proposed.

Before release, record the last deployed commit. Roll back an approved publication
with a reviewed revert commit restoring the prior static files, normal push and
Pages verification; no force-push, Docker/DNS rollback or Worker replacement needed.
The last pre-redesign source commit is 6514060; retain it as the rollback reference.

An isolated local portfolio scaffold exists outside this checkout. It is not linked,
bundled, committed to this public repo, deployed or assigned a route. Its exact local
location is provided to the owner separately, not published as infrastructure detail.
