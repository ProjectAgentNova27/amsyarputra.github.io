# amsyarputra.net

Personal tech portal for Amsyar Putra.

This site is hosted using GitHub Pages and fronted by Cloudflare. It provides a public homepage, discovery metadata, status pages, and links to selected private services protected through Cloudflare Access, VPN, or local authentication.

## Public Site

- `https://amsyarputra.net/` — public homepage
- `https://amsyarputra.net/privacy.html` — privacy information
- `https://amsyarputra.net/status.html` — portal hostname status
- `https://amsyarputra.net/vpn.html` — private access guide

## Private Portal Services

These services are intended to be protected by Cloudflare Access or local authentication:

| URL | Service | Purpose |
| --- | --- | --- |
| `https://home.amsyarputra.net` | Homepage | Main private dashboard |
| `https://dns.amsyarputra.net` | Technitium DNS | DNS admin and local resolver |
| `https://docker.amsyarputra.net` | Portainer | Docker container management |
| `https://files.amsyarputra.net` | File Browser | Web file manager |
| `https://tools.amsyarputra.net` | IT-Tools | Browser utility tools |
| `https://pdf.amsyarputra.net` | Stirling PDF | PDF tools |
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

## Local Mac Mini Stack

Core stack:

- Homepage
- Technitium DNS
- Cloudflare Tunnel
- Portainer
- File Browser
- IT-Tools
- Stirling PDF
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
