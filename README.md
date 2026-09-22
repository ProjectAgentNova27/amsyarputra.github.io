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
The portal status badge uses the `emu` key from the status API. Emulator does not
require Cloudflare Access; a successful public response is checked like other
public services.

Most services below use Cloudflare Access or local authentication; Emulator and
the short-link redirect domain are public:

| URL | Service | Purpose |
| --- | --- | --- |
| `https://home.amsyarputra.net` | Homepage | Main private dashboard |
| `https://dns.amsyarputra.net` | Technitium DNS | DNS admin and local resolver |
| `https://docker.amsyarputra.net` | Portainer | Docker container management |
| `https://files.amsyarputra.net` | File Browser | Web file manager |
| `https://tools.amsyarputra.net` | IT-Tools | Browser utility tools |
| `https://pdf.amsyarputra.net` | BentoPDF | Browser-based PDF tools |
| `https://emu.amsyarputra.net` | Emulator | Browser retro emulation using your own local game files |
| `https://lab.amsyarputra.net` | Amsyar Lab | Cloudflare Access-protected image, media, OCR and file processing |
| `https://drop.amsyarputra.net` | PairDrop | Browser file transfer |
| `https://shlink.amsyarputra.net` | Shlink Admin | Short-link admin UI |
| `https://s.amsyarputra.net` | Shlink | Public short-link redirect domain |
| `https://convert.amsyarputra.net` | ConvertX | File, document, media, and image converter |
| `https://news.amsyarputra.net` | FreshRSS | Self-hosted RSS/news aggregator |
| `https://paste.amsyarputra.net` | PrivateBin | Encrypted paste sharing |
| `https://beszel.amsyarputra.net` | Beszel | Mac mini and container monitoring |
| `https://actions.amsyarputra.net` | OliveTin Actions | Mac mini maintenance actions |
| `https://router.amsyarputra.net` | Router | ASUS router administration |
| `https://sunshine.amsyarputra.net` | Sunshine Admin | Game streaming host admin |

## Discovery Endpoints

Amsyar Lab is deployed at `https://lab.amsyarputra.net` behind Cloudflare Access,
with LAN/VPN access at `https://lab.lan.amsyarputra.net`.
It offers 48 image, media, OCR, QR, metadata and file operations using temporary
server uploads, with completed results expiring after 30 minutes. Network tools
are disabled. The portal and both Worker inventories use status key `lab`.
An unauthenticated Access redirect is reported as Protected, not Offline, and
does not prove the underlying processing backend is healthy. The Cloudflare
Published Application target remains `http://lab-ingress:8080`.

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
- Emulator (self-hosted EmulatorJS 4.2.3 assets; client-side emulation)
- Amsyar Lab (Access-protected server processing; temporary files)
- PairDrop
- Shlink
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
