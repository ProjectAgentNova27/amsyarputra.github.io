document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");
    const timezone = document.getElementById("visitor-timezone");
    const time = document.getElementById("visitor-time");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    if (timezone) {
        timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
    }

    function updateTime() {
        if (!time) return;

        time.textContent = new Intl.DateTimeFormat(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }).format(new Date());
    }

    updateTime();
    setInterval(updateTime, 1000);
});