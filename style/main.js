(function () {
    function setYear() {
        const yearElement = document.getElementById("year");
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    function setVisitorInfo() {
        const timezoneElement = document.getElementById("visitor-timezone");
        const timeElement = document.getElementById("visitor-time");

        if (!timezoneElement && !timeElement) {
            return;
        }

        let timezone = "Unknown";

        try {
            timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
        } catch (error) {
            timezone = "Unknown";
        }

        if (timezoneElement) {
            timezoneElement.textContent = timezone;
        }

        function updateTime() {
            if (!timeElement) {
                return;
            }

            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        }

        updateTime();
        window.setInterval(updateTime, 1000);
    }

    function protectDisabledLinks() {
        const disabledLinks = document.querySelectorAll("a.disabled");

        disabledLinks.forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
            });
        });
    }

    function confirmProtectedLinks() {
        const protectedLinks = document.querySelectorAll("a.protected-link");

        protectedLinks.forEach(function (link) {
            link.addEventListener("click", function (event) {
                const confirmed = window.confirm(
                    "This is a protected private service. Continue only if you are authorised."
                );

                if (!confirmed) {
                    event.preventDefault();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setYear();
        setVisitorInfo();
        protectDisabledLinks();
        confirmProtectedLinks();
    });
})();