const ALLOWED_ORIGINS = [
  "https://amsyarputra.net",
  "https://status-api.amsyarputra.net"
];

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
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request)
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return jsonResponse(request, { error: "Method not allowed" }, 405);
    }

    if (
      url.pathname === "/" ||
      url.pathname === "/status.json" ||
      url.pathname === "/.well-known/status" ||
      url.pathname === "/.well-known/portal-status"
    ) {
      return handlePortalStatus(request, env);
    }

    return jsonResponse(
      request,
      {
        error: "Not found",
        availableEndpoints: [
          "/status.json",
          "/.well-known/status",
          "/.well-known/portal-status"
        ]
      },
      404
    );
  }
};

async function handlePortalStatus(request, env) {
  const checkedAt = new Date().toISOString();
  const services = await runChecks(env, checkedAt);

  const online = services.filter((item) => item.status === "online").length;
  const offline = services.filter((item) => item.status === "offline").length;
  const protectedCount = services.filter((item) => item.status === "protected").length;
  const total = services.length;

  return jsonResponse(
    request,
    {
      status: offline === 0 ? "ok" : "degraded",
      service: "amsyarputra.net home portal",
      checked_at: checkedAt,
      total,
      online,
      protected: protectedCount,
      offline,
      note: "Cloudflare Access-protected apps may return login, redirect, 401, or 403 responses. These are treated as reachable. This checks hostname reachability, not authenticated backend health.",
      services
    },
    200
  );
}

async function runChecks(env, checkedAt) {
  const checks = [];
  const batchSize = Number(env.STATUS_CHECK_CONCURRENCY || 4);

  for (let index = 0; index < SERVICES.length; index += batchSize) {
    const batch = SERVICES.slice(index, index + batchSize);
    const results = await Promise.allSettled(
      batch.map((service) => checkService(service, env, checkedAt))
    );

    checks.push(...results);
  }

  return checks.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    return offlineResult(SERVICES[index], checkedAt, "check_failed");
  });
}

async function checkService(service, env, checkedAt) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const headers = {
    "User-Agent": "amsyarputra-portal-status-checker"
  };

  try {
    const response = await fetch(service.healthUrl || service.url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers,
      cf: {
        cacheTtl: 0,
        cacheEverything: false
      }
    });

    clearTimeout(timeout);

    const responseMs = Date.now() - startedAt;
    await discardResponseBody(response);

    const protectedStatuses = [401, 403];
    const redirectStatuses = [301, 302, 303, 307, 308];
    const onlineStatuses = service.healthUrl ? [200, 204] : [200, 204, 400, 404, 405];
    const cloudflareOriginErrors = [502, 520, 521, 522, 523, 524];

    if (isAccessProtectedResponse(response, protectedStatuses, redirectStatuses)) {
      return checkedResult(service, checkedAt, "protected", "PROTECTED", response.status, responseMs);
    }

    if (!service.healthUrl && redirectStatuses.includes(response.status)) {
      return checkedResult(service, checkedAt, "online", "ONLINE", response.status, responseMs);
    }

    if (onlineStatuses.includes(response.status)) {
      return checkedResult(service, checkedAt, "online", "ONLINE", response.status, responseMs);
    }

    if (cloudflareOriginErrors.includes(response.status)) {
      return checkedResult(
        service,
        checkedAt,
        "offline",
        "OFFLINE",
        response.status,
        responseMs,
        "cloudflare_origin_error"
      );
    }

    return checkedResult(
      service,
      checkedAt,
      "offline",
      "OFFLINE",
      response.status,
      responseMs,
      "unexpected_status"
    );
  } catch (error) {
    clearTimeout(timeout);
    return offlineResult(service, checkedAt, "unreachable");
  }
}

function isAccessProtectedResponse(response, protectedStatuses, redirectStatuses) {
  if (protectedStatuses.includes(response.status)) {
    return true;
  }

  if (!redirectStatuses.includes(response.status)) {
    return false;
  }

  const location = response.headers.get("Location") || "";
  const authenticate = response.headers.get("WWW-Authenticate") || "";

  return (
    location.includes("/cdn-cgi/access/login/") ||
    authenticate.toLowerCase().includes("cloudflare-access")
  );
}

async function discardResponseBody(response) {
  if (!response.body) {
    return;
  }

  try {
    await response.body.cancel();
  } catch (_) {
    // The status checker only needs headers/status; ignore body disposal errors.
  }
}

function checkedResult(service, checkedAt, status, label, httpStatus, responseMs, error) {
  const result = {
    key: service.key,
    name: service.name,
    url: service.url,
    description: service.description,
    access: service.access,
    status,
    label,
    http_status: httpStatus,
    response_ms: responseMs,
    checked_at: checkedAt
  };

  if (error) {
    result.error = error;
  }

  return result;
}

function offlineResult(service, checkedAt, error) {
  return {
    key: service.key,
    name: service.name,
    url: service.url,
    description: service.description,
    access: service.access,
    status: "offline",
    label: "OFFLINE",
    http_status: null,
    response_ms: null,
    checked_at: checkedAt,
    error
  };
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  const allowOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : "https://amsyarputra.net";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=30"
  };
}

function jsonResponse(request, data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
