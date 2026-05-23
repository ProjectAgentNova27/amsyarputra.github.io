const PORTAL_STATUS_ENDPOINT = "https://amsyarputra.net/.well-known/portal-status";

const SERVICE_ICONS = {
    website: "fas fa-globe",
    home: "fas fa-house-laptop",
    dns: "fas fa-network-wired",
    docker: "fas fa-cubes",
    files: "fas fa-folder-open",
    drop: "fas fa-share-nodes",
    tools: "fas fa-screwdriver-wrench",
    pdf: "fas fa-file-pdf",
    router: "fas fa-wifi",
    sunshine: "fas fa-sun",
    shlink: "fas fa-link",
    short: "fas fa-arrow-up-right-from-square"
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
    if (status === "online" || status === "ok") {
        return {
            state: "online",
            text: "Online"
        };
    }

    if (status === "offline") {
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

async function loadStatusPage() {
    const overallStatus = document.getElementById("overall-status");
    const servicesOnline = document.getElementById("services-online");
    const lastChecked = document.getElementById("last-checked");
    const servicesContainer = document.getElementById("status-services");

    try {
        const response = await fetch(PORTAL_STATUS_ENDPOINT, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Portal status returned HTTP ${response.status}`);
        }

        const data = await response.json();

        const services = Array.isArray(data.services) ? data.services : [];
        const onlineCount = services.filter((service) => service.status === "online").length;
        const totalCount = services.length;

        const overall = data.status === "ok"
            ? { state: "online", text: "Operational" }
            : { state: "offline", text: "Degraded" };

        setPill(overallStatus, overall.state, overall.text);

        if (servicesOnline) {
            servicesOnline.textContent = `${onlineCount}/${totalCount}`;
        }

        if (lastChecked) {
            lastChecked.textContent = formatDateTime(data.checked_at);
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
                        <small>Check the Worker portal-status endpoint</small>
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