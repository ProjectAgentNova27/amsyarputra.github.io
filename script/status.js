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
    "convert",
    "router",
    "sunshine",
    "actions"
];

function setStatus(key, state, text) {
    const pills = document.querySelectorAll(`[data-status-key="${key}"]`);

    if (!pills.length) {
        return;
    }

    pills.forEach((pill) => {
        pill.textContent = text;
        pill.classList.remove("pending", "online", "offline", "unknown", "protected");
        pill.classList.add(state);
    });
}

function normaliseStatus(status) {
    const value = String(status || "").toLowerCase();

    if (value === "online" || value === "ok") {
        return ["online", "Online"];
    }

    if (value === "protected") {
        return ["protected", "Protected"];
    }

    if (value === "offline") {
        return ["offline", "Offline"];
    }

    return ["unknown", "Unknown"];
}

function extractServices(data) {
    if (Array.isArray(data.services)) {
        return data.services;
    }

    return Object.entries(data)
        .filter(([key, value]) => {
            return (
                KNOWN_STATUS_KEYS.includes(key) &&
                value &&
                typeof value === "object"
            );
        })
        .map(([key, value]) => ({
            key,
            ...value
        }));
}

async function refreshPortalStatus() {
    KNOWN_STATUS_KEYS.forEach((key) => {
        setStatus(key, "pending", "Checking");
    });

    try {
        const response = await fetch(STATUS_ENDPOINT, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Status endpoint returned ${response.status}`);
        }

        const data = await response.json();
        const services = extractServices(data);

        if (!services.length) {
            throw new Error("No services found in status response");
        }

        services.forEach((service) => {
            if (!service.key) {
                return;
            }

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