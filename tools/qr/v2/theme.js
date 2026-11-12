// Apply appearance before paint, with a preference scoped to AP. QR.
(() => {
    const modes = { system: 'light', light: 'dark', dark: 'system' };
    const icons = { system: 'laptop', light: 'sun', dark: 'moon' };
    const colors = { light: '#f7f8fa', dark: '#111317' };
    const media = matchMedia('(prefers-color-scheme: dark)');
    let appearance = 'system';
    let button;
    try {
        const stored = localStorage.getItem('ap-qr-theme') ?? localStorage.getItem('portal-theme');
        if (Object.hasOwn(modes, stored)) appearance = stored;
    } catch (_) { /* Appearance storage is optional. */ }

    function apply() {
        const theme = appearance === 'system' ? (media.matches ? 'dark' : 'light') : appearance;
        document.documentElement.dataset.theme = theme;
        document.querySelector('meta[name="theme-color"]').content = colors[theme];
        if (button) {
            button.title = `Appearance: ${appearance}. Switch to ${modes[appearance]}`;
            button.setAttribute('aria-label', button.title);
            button.querySelector('use').setAttribute('href', '/assets/icons.svg#' + icons[appearance]);
        }
    }

    apply();
    media.addEventListener('change', apply);
    document.addEventListener('DOMContentLoaded', () => {
        button = document.getElementById('appearance');
        apply();
        button.hidden = false;
        button.addEventListener('click', () => {
            appearance = modes[appearance];
            try { localStorage.setItem('ap-qr-theme', appearance); } catch (_) { /* Optional. */ }
            apply();
        });
    });
})();
