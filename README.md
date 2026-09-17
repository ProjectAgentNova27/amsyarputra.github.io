# amsyarputra.net

Personal tech portal for Amsyar Putra.

This site is hosted using GitHub Pages and fronted by Cloudflare. It provides a public homepage, discovery metadata, status pages, and links to selected private services protected through Cloudflare Access, VPN, or local authentication.

## Public Site

- `https://amsyarputra.net/` — public homepage
- `https://amsyarputra.net/privacy.html` — privacy information
- `https://amsyarputra.net/status.html` — portal hostname status
- `https://amsyarputra.net/vpn.html` — private access guide

## Private Portal Services

The Cloudflare Access-protected browser emulator at `https://emu.amsyarputra.net` lets invited visitors bring
their own local game and BIOS files. Files stay on their device; the Mac mini
serves only the static frontend and pinned EmulatorJS 4.2.3 assets. No games,
BIOS, firmware, keys or ROM library are provided. LAN access is available at
`https://emu.lan.amsyarputra.net`. The service and public route are deployed.
Progress checkpoints are stored only in the player's browser, with seven-day
retention, an automatic save attempt every 60 seconds, and a save-before-quit
confirmation. Reselect the same game to restore; game and BIOS files are not
persisted. Core support and browser storage availability vary. Export saves for
a durable backup. Public and LAN hostnames have separate browser storage.
No status badge is added until the separate status API knows about this service.

These services are intended to be protected by Cloudflare Access or local authentication:

| URL | Service | Purpose |
| --- | --- | --- |
| `https://home.amsyarputra.net` | Homepage | Main private dashboard |
| `https://dns.amsyarputra.net` | Technitium DNS | DNS admin and local resolver |
| `https://docker.amsyarputra.net` | Portainer | Docker container management |
| `https://files.amsyarputra.net` | File Browser | Web file manager |
| `https://tools.amsyarputra.net` | IT-Tools | Browser utility tools |
| `https://pdf.amsyarputra.net` | BentoPDF | Browser-based PDF tools |
| `https://emu.amsyarputra.net` | Emulator | Browser retro emulation using your own local game files |
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
