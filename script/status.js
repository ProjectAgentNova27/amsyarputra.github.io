const STATUS_ENDPOINT = "https://status-api.amsyarputra.net/status.json";

const KNOWN_STATUS_KEYS = [
    "website",
    "home",
    "dns",
    "docker",
    "files",
    "drop",
    "shlink",
    "short",
    "tools",
    "pdf",
    "router",
    "sunshine"
];

function setStatus(key, state, text) {
    const pills = document.querySelectorAll(`[data-status-key="${key}"]`);

    if (!pills.length) return;

    pills.forEach((pill) => {
        pill.textContent = text;
        pill.classList.remove("pending", "online", "offline", "unknown", "protected");
        pill.classList.add(state);
    });
}

function normaliseStatus(status) {
    if (status === "online" || status === "ok") {
        return ["online", "Online"];
    }

    if (status === "protected") {
        return ["protected", "Protected"];
    }

    if (status === "offline") {
        return ["offline", "Offline"];
    }

    return ["unknown", "Unknown"];
}

async function refreshPortalStatus() {
    KNOWN_STATUS_KEYS.forEach((key) => {
        setStatus(key, "pending", "Checking");
    });

    try {
        const response = await fetch(STATUS_ENDPOINT, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Status endpoint returned ${response.status}`);
        }

        const data = await response.json();
        const services = Array.isArray(data.services)
            ? data.services
            : Object.entries(data)
                .filter(([key, value]) => key !== "checkedAt" && value && typeof value === "object")
                .map(([key, value]) => ({ key, ...value }));

        services.forEach((service) => {
            const [state, text] = normaliseStatus(service.status);
            setStatus(service.key, state, text);
        });
    } catch (error) {
        console.error("Portal status check failed:", error);

        KNOWN_STATUS_KEYS.forEach((key) => {
            setStatus(key, "unknown", "Unknown");
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    refreshPortalStatus();
});