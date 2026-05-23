const PORTAL_STATUS_ENDPOINT = "https://status-api.amsyarputra.net/status.json";

const SERVICE_ICONS = {
    website: "fas fa-globe",
    home: "fas fa-house-laptop",
    dns: "fas fa-network-wired",
    docker: "fas fa-cubes",
    files: "fas fa-folder-open",
    drop: "fas fa-share-nodes",
    shlink: "fas fa-link",
    short: "fas fa-arrow-up-right-from-square",
    tools: "fas fa-screwdriver-wrench",
    pdf: "fas fa-file-pdf",
    router: "fas fa-wifi",
    sunshine: "fas fa-sun"
};

function setPill(element, state, text) {
    if (!element) return;

    element.textContent = text;
    element.classList.remove("pending", "online", "offline", "unknown", "protected");
    element.classList.add(state);
}

function formatDateTime(value) {
    if (!value) return "Unknown";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).format(date);
}

function statusToDisplay(status) {
    const value = String(status || "").toLowerCase();

    if (value === "online" || value === "ok") {
        return {
            state: "online",
            text: "Online"
        };
    }

    if (value === "protected") {
        return {
            state: "protected",
            text: "Protected"
        };
    }

    if (value === "offline") {
        return {
            state: "offline",
            text: "Offline"
        };
    }

    return {
        state: "unknown",
        text: "Unknown"
    };
}

function createServiceCard(service) {
    const card = document.createElement("a");
    card.className = "link";
    card.href = service.url || "#";

    if (service.url) {
        card.target = "_blank";
        card.rel = "noopener noreferrer";
    }

    const icon = document.createElement("i");
    icon.className = SERVICE_ICONS[service.key] || "fas fa-server";

    const title = document.createElement("span");
    title.textContent = service.name || service.key || "Service";

    const small = document.createElement("small");

    const status = statusToDisplay(service.status);

    const description = document.createElement("span");
    description.textContent = service.description || "Service endpoint";

    const pill = document.createElement("span");
    pill.className = `status-pill ${status.state}`;
    pill.textContent = status.text;

    small.appendChild(description);
    small.appendChild(document.createTextNode(" "));
    small.appendChild(pill);

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(small);

    return card;
}

function normaliseServices(data) {
    if (Array.isArray(data.services)) {
        return data.services;
    }

    const ignoredKeys = [
        "status",
        "service",
        "checked_at",
        "checkedAt",
        "total",
        "online",
        "protected",
        "offline",
        "note"
    ];

    return Object.entries(data)
        .filter(([key, value]) => {
            return !ignoredKeys.includes(key) && value && typeof value === "object";
        })
        .map(([key, value]) => ({
            key,
            ...value
        }));
}

async function loadStatusPage() {
    const overallStatus = document.getElementById("overall-status");
    const servicesOnline = document.getElementById("services-online");
    const servicesProtected = document.getElementById("services-protected");
    const servicesOffline = document.getElementById("services-offline");
    const lastChecked = document.getElementById("last-checked");
    const servicesContainer = document.getElementById("status-services");

    try {
        const response = await fetch(PORTAL_STATUS_ENDPOINT, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Portal status returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const services = normaliseServices(data);

        const onlineCount = services.filter((service) => service.status === "online").length;
        const protectedCount = services.filter((service) => service.status === "protected").length;
        const offlineCount = services.filter((service) => service.status === "offline").length;
        const totalCount = services.length;

        const overall = offlineCount === 0
            ? { state: "online", text: "Operational" }
            : { state: "offline", text: "Degraded" };

        setPill(overallStatus, overall.state, overall.text);

        if (servicesOnline) {
            servicesOnline.textContent = `${onlineCount}/${totalCount}`;
        }

        if (servicesProtected) {
            servicesProtected.textContent = `${protectedCount}/${totalCount}`;
        }

        if (servicesOffline) {
            servicesOffline.textContent = `${offlineCount}/${totalCount}`;
        }

        if (lastChecked) {
            lastChecked.textContent = formatDateTime(data.checked_at || data.checkedAt);
        }

        if (servicesContainer) {
            servicesContainer.innerHTML = "";

            services.forEach((service) => {
                servicesContainer.appendChild(createServiceCard(service));
            });

            if (!services.length) {
                servicesContainer.innerHTML = `
                    <div class="link disabled">
                        <i class="fas fa-circle-exclamation"></i>
                        <span>No services returned</span>
                        <small>Check the status API endpoint</small>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error("Failed to load status page:", error);

        setPill(overallStatus, "unknown", "Unknown");

        if (servicesOnline) {
            servicesOnline.textContent = "Unknown";
        }

        if (servicesProtected) {
            servicesProtected.textContent = "Unknown";
        }

        if (servicesOffline) {
            servicesOffline.textContent = "Unknown";
        }

        if (lastChecked) {
            lastChecked.textContent = "Failed to check";
        }

        if (servicesContainer) {
            servicesContainer.innerHTML = `
                <div class="link disabled">
                    <i class="fas fa-triangle-exclamation"></i>
                    <span>Status unavailable</span>
                    <small>Unable to reach the portal status endpoint</small>
                </div>
            `;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadStatusPage();
});