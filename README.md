# amsyarputra.net

Personal tech portal for Amsyar Putra.

This site is hosted using GitHub Pages and fronted by Cloudflare. It provides a public homepage, discovery metadata, status pages, and links to selected private services protected through Cloudflare Access, VPN, or local authentication.

## Public Site

- `https://amsyarputra.net/` — public homepage
- `https://amsyarputra.net/privacy.html` — privacy information
- `https://amsyarputra.net/status.html` — portal hostname status
- `https://amsyarputra.net/vpn.html` — private access guide

## Private Portal Services

The public browser emulator at `https://emu.amsyarputra.net` lets visitors bring
their own local game and BIOS files. Files stay on their device; the Mac mini
serves only the static frontend and pinned EmulatorJS 4.2.3 assets. No games,
BIOS, firmware, keys or ROM library are provided. LAN access is available at
`https://emu.lan.amsyarputra.net`. The service and public route are deployed.
Progress checkpoints are stored only in the player's browser, with seven-day
retention, an automatic save attempt every 60 seconds, and a save-before-quit
confirmation. Reselect the same game to restore; game and BIOS files are not
persisted. Core support and browser storage availability vary. Export saves for
a durable backup. Public and LAN hostnames have separate browser storage.
Settings, controls and cheats persist locally per game without an account. Save-state
and in-game save exports offer a prepared Save / Share action where supported, with
a browser download fallback. No cross-device synchronization is provided.
The portal status badge uses the `emu` key from the status API. Emulator does not
require Cloudflare Access; a successful public response is checked like other
public services.

Most services below use Cloudflare Access or local authentication; Document Studio, Emulator, Mini Booth, Mini Photo and
the short-link redirect domain are public:

| URL | Service | Purpose |
| --- | --- | --- |
| `https://home.amsyarputra.net` | Homepage | Main private dashboard |
| `https://dns.amsyarputra.net` | Technitium DNS | DNS admin and local resolver |
| `https://docker.amsyarputra.net` | Portainer | Docker container management |
| `https://files.amsyarputra.net` | File Browser | Web file manager |
| `https://tools.amsyarputra.net` | IT-Tools | Browser utility tools |
| `https://pdf.amsyarputra.net` | BentoPDF | Browser-based PDF tools |
| `https://docs.amsyarputra.net` | Document Studio | On-device document scanner and offline document workspace |
| `https://emu.amsyarputra.net` | Emulator | Browser retro emulation using your own local game files |
| `https://booth.amsyarputra.net` | Mini Booth | iPhone/iPad photobooth, print layouts and approved remote shutter |
| `https://photo.amsyarputra.net` | Mini Photo | iPhone/iPad local photo editing and metadata frames |
| `https://lab.amsyarputra.net` | Amsyar Lab | Cloudflare Access-protected image, media, OCR and file processing |
| `https://drop.amsyarputra.net` | PairDrop | Browser file transfer |
| `https://shlink.amsyarputra.net` | Mini Links | Access-protected short-link management with application authentication |
| `https://s.amsyarputra.net` | Mini Links redirects | Existing public short-link redirect domain |
| `https://convert.amsyarputra.net` | ConvertX | File, document, media, and image converter |
| `https://news.amsyarputra.net` | FreshRSS | Self-hosted RSS/news aggregator |
| `https://paste.amsyarputra.net` | PrivateBin | Encrypted paste sharing |
| `https://beszel.amsyarputra.net` | Beszel | Mac mini and container monitoring |
| `https://actions.amsyarputra.net` | OliveTin Actions | Mac mini maintenance actions |
| `https://router.amsyarputra.net` | Router | ASUS router administration |
| `https://sunshine.amsyarputra.net` | Sunshine Admin | Game streaming host admin |

## Discovery Endpoints

### Document Studio and Mini Links (9 October 2026)

Document Studio is deployed via the existing Caddy gateway at docs.amsyarputra.net.
Documents are processed locally, with recoverable temporary sessions and optional
saved projects in browser storage. Storage can be evicted: export backups. Core
editing/export works offline after caching; optional English OCR needs its local
assets cached separately. No uploads or remote processing. Searchable PDF text
layers are not implemented; physical mobile camera/share acceptance is pending.

Mini Links replaced the public Shlink routes after a backed-up, verified migration
of 1 link and 12,918 historical visit records including orphan history. Existing
redirect semantics and encoded query strings were checked. Access protection,
application authentication and LAN management hostname are preserved. Legacy
Shlink/database/client remain retained until separate retirement approval.

Reviewed Worker sources now live in `cloudflare/`. Deploy each file to its SAME
existing Worker (portal-status-api and amsyar-markdown-agent), preserving bindings,
routes, Access and secrets. GitHub Pages publication does NOT deploy Workers.
`docs` uses /healthz; existing `shlink` and `short` keys are retained, with the public
shortener checked through /healthz rather than its homepage redirect. Until deployed,
a missing docs status remains Unknown. See cloudflare/README.md for verification.
Existing sitemap/robots/security files govern the main domain only; these separate
service subdomains do not need added main-domain sitemap entries or crawler grants.

After every service addition/update, review website listings/discovery, both Worker
inventories, and documentation; update as needed, test the changed contracts, then
commit/push only relevant source. Verify Pages and Worker publication separately.

Mini Booth is public at `https://booth.amsyarputra.net` for compatible iPhone/iPad
browsers and Home Screen web apps. It preserves eight-shot/four-selection sessions,
themes, editing, image/PDF/GIF exports and session ZIPs with motion and silent video.
Additional finished formats are Modern 2x6, Retro 1.5x6, Extended 2.5x8 and Wide
3.5x5 inches, with exact-size PDFs and suitable print-sheet layouts.
Remote shutter pairs a second device after host approval, captures one photo per
command and waits for manual progression. Optional framing preview is end-to-end
encrypted; originals stay in browser memory on the host. Remote pairings expire
after 30 minutes. Explicit download QR sharing uploads only an encrypted finished
copy for up to 15 minutes; this is separate from remote pairing.

The homepage, status page and static discovery catalog now recognize `booth`.
Add `booth` to the deployed portal-status-api and amsyar-markdown-agent inventories
separately, using the public URL and `https://booth.amsyarputra.net/healthz` for the
health probe. Missing API results remain Unknown. This website commit does not
deploy Workers or alter Cloudflare configuration. The existing root sitemap,
robots.txt, security contact and VPN guide need no new routes for this separate
public hostname; they do not govern crawling of Mini Booth or its private links.

Amsyar Lab is deployed at `https://lab.amsyarputra.net` behind Cloudflare Access,
with LAN/VPN access at `https://lab.lan.amsyarputra.net`.
It offers 48 image, media, OCR, QR, metadata and file operations using temporary
server uploads, up to 500 MB total per conversion job (QR limits stay smaller),
with completed results expiring after five minutes. Network tools
are disabled. The portal and both Worker inventories use status key `lab`.
An unauthenticated Access redirect is reported as Protected, not Offline, and
does not prove the underlying processing backend is healthy. The Cloudflare
Published Application uses the existing maintenance gateway `http://caddy:8080`,
which routes Lab to `lab-ingress:8080`.

Deploy the updated portal-status-api and amsyar-markdown-agent Workers before
publishing these website changes. Until the status Worker includes `lab`, its
badge correctly shows Unknown rather than fabricating a health result.

The existing sitemap, robots, security contact and crawler exclusions need no
new entries for this separate protected subdomain. The VPN guide includes Lab.
Discovery metadata does not grant access or override Cloudflare Access.

The static `.well-known/api-catalog.json` lists services, including the public
Emulator. The markdown Cloudflare Worker separately serves `/openapi.json`,
`/docs/api`, `/.well-known/api-catalog`, and status aliases; these are not missing
GitHub Pages files. Keep the Worker's service inventory synchronized when adding
services. `status.html` renders service cards from the status API rather than
maintaining a duplicate HTML list. Emulator is keyed as `emu` in both Workers.
The main-domain sitemap and robots file do not control crawling on the separate
Emulator hostname.

- `/.well-known/api-catalog`
- `/.well-known/api-catalog.json`
- `/.well-known/status`
- `/.well-known/portal-status`
- `/openapi.json`
- `/docs/api`
- `/sitemap.xml`
- `/robots.txt`

## Feed Lists

- `https://amsyarputra.net/feeds/amsyar-news-tech.opml` — OPML import list for FreshRSS and Reeder

## Local Mac Mini Stack

Core stack:

- Homepage
- Technitium DNS
- Cloudflare Tunnel
- Portainer
- File Browser
- IT-Tools
- BentoPDF
- Document Studio (browser-local scanning; cached offline export and optional OCR)
- Emulator (self-hosted EmulatorJS 4.2.3 assets; client-side emulation)
- Amsyar Lab (Access-protected server processing; temporary files)
- Mini Booth (iPhone/iPad; browser-local photos, physical print presets, remote shutter)
- Mini Photo (iPhone/iPad; browser-local editing, metadata frames, optional local recovery)
- PairDrop
- Mini Links (Python/SQLite; legacy Shlink retained for rollback)
- ConvertX
- FreshRSS
- PrivateBin
- Beszel
- OliveTin
- DIUN
- Telegram bot
- Caddy LAN reverse proxy


FreshRSS notes:

- Public URL: `https://news.amsyarputra.net`
- Refresh schedule: `CRON_MIN="3,18,33,48"`
