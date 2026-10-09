const SITE_ORIGIN = "https://amsyarputra.net";
const STATUS_API = "https://status-api.amsyarputra.net/status.json";

const SERVICES = [
  {
    key: "docs",
    name: "Document Studio",
    url: "https://docs.amsyarputra.net",
    healthUrl: "https://docs.amsyarputra.net/healthz",
    description: "On-device document scanning, local drafts/projects and PDF/image export; optional cached offline English OCR.",
    access: "public"
  },
  {
    key: "photo",
    name: "Mini Photo",
    url: "https://photo.amsyarputra.net",
    healthUrl: "https://photo.amsyarputra.net/healthz",
    description: "iPhone/iPad photo editor; local image processing, metadata frames and optional browser recovery.",
    access: "public"
  },
  {
    key: "booth",
    name: "Mini Booth",
    url: "https://booth.amsyarputra.net",
    healthUrl: "https://booth.amsyarputra.net/healthz",
    description: "iPhone/iPad photobooth; browser-local photos, print layouts and approved remote shutter.",
    access: "public"
  },
  {
    key: "lab",
    name: "Amsyar Lab",
    url: "https://lab.amsyarputra.net",
    description: "Image, media, OCR and file tools; temporary server uploads. Cloudflare Access required.",
    access: "cloudflare-access"
  },
  {
    key: "emu",
    name: "Emulator",
    url: "https://emu.amsyarputra.net",
    description: "Browser retro emulator; bring your own games. Local progress, settings and cheats; save-file exports.",
    access: "public"
  },
  {
    key: "website",
    name: "Public Website",
    url: "https://amsyarputra.net",
    description: "Public GitHub Pages homepage",
    access: "public"
  },
  {
    key: "home",
    name: "Home Dashboard",
    url: "https://home.amsyarputra.net",
    description: "Main private home dashboard",
    access: "cloudflare-access"
  },
  {
    key: "dns",
    name: "Technitium DNS",
    url: "https://dns.amsyarputra.net",
    description: "DNS admin and local resolver",
    access: "cloudflare-access"
  },
  {
    key: "docker",
    name: "Docker",
    url: "https://docker.amsyarputra.net",
    description: "Portainer container management",
    access: "cloudflare-access"
  },
  {
    key: "files",
    name: "Files",
    url: "https://files.amsyarputra.net",
    description: "File Browser web file manager",
    access: "cloudflare-access"
  },
  {
    key: "drop",
    name: "PairDrop",
    url: "https://drop.amsyarputra.net",
    description: "Browser-based AirDrop-style file transfer",
    access: "cloudflare-access"
  },
  {
    key: "shlink",
    name: "Mini Links",
    url: "https://shlink.amsyarputra.net",
    description: "Protected Python/SQLite short-link management with application authentication.",
    access: "cloudflare-access"
  },
  {
    key: "short",
    name: "Short Links",
    url: "https://s.amsyarputra.net",
    healthUrl: "https://s.amsyarputra.net/healthz",
    description: "Public short-link redirect domain",
    access: "public"
  },
  {
    key: "tools",
    name: "IT Tools",
    url: "https://tools.amsyarputra.net",
    description: "Self-hosted utility tools",
    access: "cloudflare-access"
  },
  {
    key: "pdf",
    name: "PDF Tools",
    url: "https://pdf.amsyarputra.net",
    description: "Stirling PDF tools",
    access: "cloudflare-access"
  },
  {
    key: "convert",
    name: "ConvertX",
    url: "https://convert.amsyarputra.net",
    description: "Self-hosted file converter for documents, media, images, and other formats",
    access: "cloudflare-access"
  },
  {
    key: "news",
    name: "FreshRSS",
    url: "https://news.amsyarputra.net",
    description: "Self-hosted RSS and news aggregator",
    access: "cloudflare-access"
  },
  {
    key: "paste",
    name: "PrivateBin",
    url: "https://paste.amsyarputra.net",
    description: "Encrypted paste sharing service",
    access: "cloudflare-access"
  },
  {
    key: "beszel",
    name: "Beszel",
    url: "https://beszel.amsyarputra.net",
    description: "Mac mini host metrics and container monitoring",
    access: "cloudflare-access"
  },
  {
    key: "router",
    name: "Router",
    url: "https://router.amsyarputra.net",
    description: "ASUS router administration",
    access: "cloudflare-access"
  },
  {
    key: "sunshine",
    name: "Sunshine Admin",
    url: "https://sunshine.amsyarputra.net",
    description: "Game streaming host admin",
    access: "cloudflare-access"
  },
  {
    key: "actions",
    name: "OliveTin Actions",
    url: "https://actions.amsyarputra.net",
    description: "Protected action panel for safe Mac mini maintenance tasks",
    access: "cloudflare-access"
  }
];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const accept = request.headers.get("Accept") || "";
    const wantsMarkdown = accept.toLowerCase().includes("text/markdown");

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/.well-known/api-catalog") {
      return jsonResponse(apiCatalog(), {
        contentType: "application/linkset+json; charset=utf-8",
        cacheControl: "public, max-age=600"
      });
    }

    if (
      url.pathname === "/status.json" ||
      url.pathname === "/.well-known/status" ||
      url.pathname === "/.well-known/portal-status"
    ) {
      return proxyStatusApi(request);
    }

    if (url.pathname === "/openapi.json") {
      return jsonResponse(openApiDocument(), {
        contentType: "application/vnd.oai.openapi+json; charset=utf-8",
        cacheControl: "public, max-age=600"
      });
    }

    if (url.pathname === "/docs/api") {
      return markdownResponse(apiDocs(), {
        cacheControl: "public, max-age=600"
      });
    }

    const isHomepage = url.pathname === "/" || url.pathname === "/index.html";

    if (isHomepage && wantsMarkdown) {
      return markdownResponse(homepageMarkdown(), {
        cacheControl: "public, max-age=600"
      });
    }

    const response = await fetch(request);
    return withDiscoveryHeaders(response);
  }
};

async function proxyStatusApi(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let response;

  try {
    response = await fetch(STATUS_API, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "User-Agent": "amsyar-markdown-agent"
      },
      cf: {
        cacheTtl: 0,
        cacheEverything: false
      }
    });
  } catch (error) {
    return new Response(
      request.method === "HEAD"
        ? null
        : JSON.stringify({
            status: "unknown",
            service: "amsyarputra.net home portal",
            error: "status_api_unreachable"
          }, null, 2),
      {
        status: 503,
        headers: {
          ...corsHeaders(),
          "Cache-Control": "no-store",
          "Content-Type": "application/json; charset=utf-8",
          "Link": discoveryLinkHeader()
        }
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", SITE_ORIGIN);
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Link", discoveryLinkHeader());

  if (request.method === "HEAD") {
    await discardResponseBody(response);
  }

  return new Response(request.method === "HEAD" ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function apiCatalog() {
  return {
    linkset: [
      {
        anchor: `${SITE_ORIGIN}/`,
        "service-desc": [
          {
            href: `${SITE_ORIGIN}/openapi.json`,
            type: "application/vnd.oai.openapi+json",
            title: "OpenAPI description"
          }
        ],
        "service-doc": [
          {
            href: `${SITE_ORIGIN}/docs/api`,
            type: "text/markdown",
            title: "API documentation"
          },
          {
            href: `${SITE_ORIGIN}/robots.txt`,
            type: "text/plain",
            title: "Robots.txt"
          }
        ],
        status: [
          {
            href: `${SITE_ORIGIN}/.well-known/status`,
            type: "application/json",
            title: "Public website status"
          },
          {
            href: `${SITE_ORIGIN}/.well-known/portal-status`,
            type: "application/json",
            title: "Home portal hostname status"
          },
          {
            href: STATUS_API,
            type: "application/json",
            title: "Dedicated portal status API"
          }
        ],
        item: SERVICES.map((service) => ({
          href: service.url,
          title: service.name,
          type: "text/html"
        }))
      }
    ]
  };
}

function openApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Amsyar Putra Site Metadata API",
      version: "3.2.1",
      description: "Public metadata, discovery, markdown, and public reachability status forwarding endpoints."
    },
    servers: [
      {
        url: SITE_ORIGIN
      },
      {
        url: "https://status-api.amsyarputra.net"
      }
    ],
    paths: {
      "/.well-known/api-catalog": {
        get: {
          summary: "Get API catalog",
          responses: {
            "200": {
              description: "Linkset JSON API catalog"
            }
          }
        }
      },
      "/.well-known/status": {
        get: {
          summary: "Get public reachability status via status API",
          responses: {
            "200": {
              description: "Status JSON"
            }
          }
        }
      },
      "/.well-known/portal-status": {
        get: {
          summary: "Get portal public reachability status via status API",
          responses: {
            "200": {
              description: "Portal status JSON"
            }
          }
        }
      },
      "/docs/api": {
        get: {
          summary: "Get API documentation",
          responses: {
            "200": {
              description: "Markdown API documentation"
            }
          }
        }
      },
      "/openapi.json": {
        get: {
          summary: "Get OpenAPI description",
          responses: {
            "200": {
              description: "OpenAPI JSON"
            }
          }
        }
      }
    }
  };
}

function apiDocs() {
  return `# Amsyar Putra Site Metadata API

This Worker provides public metadata and discovery endpoints for amsyarputra.net.

## Main endpoints

- [API Catalog](${SITE_ORIGIN}/.well-known/api-catalog)
- [Public Status](${SITE_ORIGIN}/.well-known/status)
- [Portal Status](${SITE_ORIGIN}/.well-known/portal-status)
- [Dedicated Status API](${STATUS_API})
- [OpenAPI](${SITE_ORIGIN}/openapi.json)
- [Docs](${SITE_ORIGIN}/docs/api)

## Portal services

${serviceListMarkdown()}

## Notes

The dedicated status API checks public hostname reachability as an unauthenticated internet visitor. Cloudflare Access-protected services show as protected when the hostname is reachable and authentication is required.

Mini Booth uses its public /healthz endpoint. A successful health response does not verify a user's camera, exports or remote pairing.
`;
}

function homepageMarkdown() {
  return `# Amsyar Putra

**TECH PORTAL**

Personal homepage for quick access to public links, tools, and selected private services.

## Main links

- [Discord](https://discord.com/app)
- [Gmail](https://mail.google.com)
- [YouTube](https://www.youtube.com)
- [PCGamingWiki](https://www.pcgamingwiki.com)
- [Spotify](https://open.spotify.com)
- [ChatGPT](https://chatgpt.com)
- [Steam](https://store.steampowered.com)
- [Email](mailto:work@amsyarputra.net)
- [Google Account](https://myaccount.google.com)

## Home portal

Private services are protected through Cloudflare Access, VPN, or local authentication. Direct DDNS fallback links are intentionally not published here.

${serviceListMarkdown()}

## Document Studio

Document Studio scans and edits documents entirely on-device. Temporary drafts and
saved projects use browser storage, which can be evicted; export project backups.
PDF/image export works offline after the application assets are cached. Optional
English OCR requires its local model/core assets to be cached first. There are no
document uploads, accounts or remote processing. Mobile camera/share support varies
by browser; searchable PDF text layers are not implemented.

## Mini Links

Mini Links serves the existing short-link and management hostnames. Management
remains protected by Cloudflare Access and application authentication. Destination
query strings, redirect semantics and historical visits were preserved during the
Shlink migration. Legacy Shlink resources remain retained for reversible rollback.

## Mini Photo

Mini Photo supports compatible iPhone/iPad browsers and Home Screen web apps.
Editing, metadata extraction and frame rendering remain on-device, without photo uploads.
Optional browser recovery expires after 24 hours, checked at launch. Browser eviction
can remove saved sessions. Visible metadata frames are separate from embedded EXIF;
exports do not copy source GPS metadata. Native Save / Share is available where supported.

## Mini Booth

Mini Booth supports compatible iPhone/iPad browsers and Home Screen web apps.
It offers photo strips, 5R layouts, Modern 2x6, Retro 1.5x6, Extended 2.5x8 and
Wide 3.5x5-inch presets, print PDFs, GIFs and session ZIPs. Ordinary capture,
editing and exports stay on the device; browser reload or termination can lose photos.

Remote shutter requires host approval and captures one photo per command, with
standby for the next shutter command and an optional end-to-end encrypted low-resolution preview.
Original photos remain on the host. Pairings expire after 30 minutes.
Explicit download QR sharing uploads only an encrypted finished copy for up to
15 minutes. Keep complete pairing and download links private.

## Discovery

- [API Catalog](${SITE_ORIGIN}/.well-known/api-catalog)
- [Public Status](${SITE_ORIGIN}/.well-known/status)
- [Portal Status](${SITE_ORIGIN}/.well-known/portal-status)
- [Dedicated Status API](${STATUS_API})
- [OpenAPI](${SITE_ORIGIN}/openapi.json)
- [API Docs](${SITE_ORIGIN}/docs/api)
- [Sitemap](${SITE_ORIGIN}/sitemap.xml)
- [Robots.txt](${SITE_ORIGIN}/robots.txt)
`;
}

function serviceListMarkdown() {
  return SERVICES.map((service) => {
    const access =
      service.access === "public"
        ? "Public"
        : "Protected by Cloudflare Access or local authentication";

    return `- [${service.name}](${service.url}) - ${service.description}. Access: ${access}.`;
  }).join("\n");
}

function markdownResponse(markdown, options = {}) {
  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": options.cacheControl || "public, max-age=600",
      "x-markdown-tokens": String(markdown.split(/\s+/).filter(Boolean).length),
      "Link": discoveryLinkHeader()
    }
  });
}

function jsonResponse(data, options = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      ...corsHeaders(),
      "Content-Type": options.contentType || "application/json; charset=utf-8",
      "Cache-Control": options.cacheControl || "public, max-age=600",
      "Link": discoveryLinkHeader()
    }
  });
}

async function discardResponseBody(response) {
  if (!response.body) {
    return;
  }

  try {
    await response.body.cancel();
  } catch (_) {
    // HEAD responses do not forward the upstream body.
  }
}

function withDiscoveryHeaders(response) {
  const headers = new Headers(response.headers);

  headers.set("Link", discoveryLinkHeader());
  headers.set("X-Portal", "amsyarputra.net");
  headers.set("X-Agent-Ready", "true");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": SITE_ORIGIN,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function discoveryLinkHeader() {
  return [
    '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
    '</sitemap.xml>; rel="sitemap"; type="application/xml"',
    '</robots.txt>; rel="service-doc"; type="text/plain"',
    '</docs/api>; rel="service-doc"; type="text/markdown"',
    `<${STATUS_API}>; rel="status"; type="application/json"`
  ].join(", ");
}
