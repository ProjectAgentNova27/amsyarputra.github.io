// Blocking, same-origin bootstrap keeps the selected appearance on first paint.
(() => {
    let preference = 'system';
    try {
        const stored = localStorage.getItem('portal-theme');
        if (['light', 'dark', 'system'].includes(stored)) preference = stored;
    } catch (_) { /* Storage is optional. */ }
    const media = matchMedia('(prefers-color-scheme: dark)');
    function apply() {
        const theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
        document.documentElement.dataset.theme = theme;
        document.documentElement.dataset.appearance = preference;
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111317' : '#f7f8fa');
        document.querySelectorAll('[data-theme-toggle]').forEach(button => {
            const next = { system: 'light', light: 'dark', dark: 'system' }[preference];
            button.title = `Appearance: ${preference}. Switch to ${next}`;
            button.setAttribute('aria-label', button.title);
            button.querySelector('use')?.setAttribute('href', `/assets/icons.svg#${preference === 'system' ? 'laptop' : preference === 'dark' ? 'moon' : 'sun'}`);
        });
    }
    apply();
    media.addEventListener('change', apply);
    document.addEventListener('DOMContentLoaded', () => {
        apply();
        document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
            preference = { system: 'light', light: 'dark', dark: 'system' }[preference];
            try { localStorage.setItem('portal-theme', preference); } catch (_) { /* Optional preference. */ }
            apply();
        }));
    });
})();
