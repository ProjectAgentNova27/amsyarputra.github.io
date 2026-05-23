const STATUS_ENDPOINTS = {
    website: "https://amsyarputra.net",
    home: "https://home.amsyarputra.net",
    dns: "https://dns.amsyarputra.net",
    docker: "https://docker.amsyarputra.net",
    files: "https://files.amsyarputra.net",
    tools: "https://tools.amsyarputra.net",
    pdf: "https://pdf.amsyarputra.net",
    router: "https://router.amsyarputra.net",
    sunshine: "https://sunshine.amsyarputra.net"
};

function setStatus(key, state, text) {
    const pills = document.querySelectorAll(`[data-status-key="${key}"]`);

    if (!pills.length) return;

    pills.forEach((pill) => {
        pill.textContent = text;
        pill.classList.remove("pending", "online", "offline", "unknown", "protected");
        pill.classList.add(state);
    });
}

async function checkStatus(key, url) {
    setStatus(key, "pending", "Checking");

    try {
        await fetch(url, {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-store"
        });

        setStatus(key, "online", "Online");
    } catch (error) {
        setStatus(key, "offline", "Offline");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    Object.entries(STATUS_ENDPOINTS).forEach(([key, url]) => {
        checkStatus(key, url);
    });
});