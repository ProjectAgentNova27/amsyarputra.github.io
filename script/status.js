(function () {
    const STATUS_API_URL = "https://status-api.amsyarputra.net/status.json";
    const REFRESH_INTERVAL_MS = 60000;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normaliseStatus(value) {
        const status = String(value || "").toLowerCase();

        if (status === "online") {
            return "online";
        }

        if (status === "offline") {
            return "offline";
        }

        if (status === "pending" || status === "checking") {
            return "pending";
        }

        return "unknown";
    }

    function toTitleCase(value) {
        const text = String(value || "").toLowerCase();

        if (!text) {
            return "Unknown";
        }

        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function setBadge(element, status, label) {
        const safeStatus = normaliseStatus(status);
        const safeLabel = label ? toTitleCase(label) : toTitleCase(safeStatus);

        element.classList.remove("online", "offline", "pending", "unknown");
        element.classList.add(safeStatus);
        element.textContent = safeLabel;
    }

    function setAllUnknown() {
        document.querySelectorAll("[data-status-key]").forEach(function (badge) {
            setBadge(badge, "unknown", "Unknown");
        });

        const checkedAtElement = document.getElementById("status-checked-at");

        if (checkedAtElement) {
            checkedAtElement.textContent = "Unable to check";
        }
    }

    async function updateStatus() {
        const badges = document.querySelectorAll("[data-status-key]");

        if (!badges.length) {
            return;
        }

        try {
            const response = await fetch(STATUS_API_URL, {
                method: "GET",
                cache: "no-store",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Status API returned " + response.status);
            }

            const data = await response.json();

            badges.forEach(function (badge) {
                const key = badge.getAttribute("data-status-key");
                const service = data[key];

                if (!service) {
                    setBadge(badge, "unknown", "Unknown");
                    return;
                }

                setBadge(badge, service.status, service.label);
            });

            const checkedAtElement = document.getElementById("status-checked-at");

            if (checkedAtElement) {
                const checkedDate = data.checkedAt ? new Date(data.checkedAt) : new Date();
                checkedAtElement.textContent = checkedDate.toLocaleString();
            }
        } catch (error) {
            setAllUnknown();
        }
    }

    ready(function () {
        updateStatus();
        window.setInterval(updateStatus, REFRESH_INTERVAL_MS);
    });
})();