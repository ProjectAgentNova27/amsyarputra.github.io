const STATUS_ENDPOINTS = {
    website: "https://amsyarputra.net",
    home: "https://home.amsyarputra.net",
    dns: "https://dns.amsyarputra.net",
    docker: "https://docker.amsyarputra.net",
    files: "https://files.amsyarputra.net",
    sync: "https://sync.amsyarputra.net",
    tools: "https://tools.amsyarputra.net",
    pdf: "https://pdf.amsyarputra.net",
    budget: "https://budget.amsyarputra.net",
    router: "https://router.amsyarputra.net",
    sunshine: "https://sunshine.amsyarputra.net"
};

function setStatus(key, state, text) {
    const pills = document.querySelectorAll(`[data-status-key="${key}"]`);

    pills.forEach((pill) => {
        pill.textContent = text;
        pill.classList.remove("pending", "online", "offline");
        pill.classList.add(state);
    });
}

async function checkStatus(key, url) {
    try {
        await fetch(url, {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-store"
        });

        setStatus(key, "online", "Online");
    } catch {
        setStatus(key, "offline", "Offline");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    Object.entries(STATUS_ENDPOINTS).forEach(([key, url]) => {
        checkStatus(key, url);
    });
});