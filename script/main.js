document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('enhanced');
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
    const timezone = document.getElementById('visitor-timezone');
    const time = document.getElementById('visitor-time');
    if (timezone) {
        try { timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'; }
        catch (_) { timezone.textContent = 'Unknown'; }
    }
    const clock = () => {
        if (time && !document.hidden) time.textContent = new Intl.DateTimeFormat(undefined, {hour:'2-digit',minute:'2-digit'}).format(new Date());
    };
    clock();
    if (time) {
        setInterval(clock, 30000);
        document.addEventListener('visibilitychange', clock);
    }
    const menu = document.querySelector('[data-menu-toggle]');
    const nav = document.getElementById('site-nav');
    const closeMenu = () => {
        if (nav?.contains(document.activeElement)) menu?.focus();
        nav?.classList.remove('open');
        menu?.setAttribute('aria-expanded','false');
        if (menu) { menu.title='Open navigation';menu.setAttribute('aria-label','Open navigation'); }
    };
    menu?.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', String(open));
        menu.title = open ? 'Close navigation' : 'Open navigation';
        menu.setAttribute('aria-label',menu.title);
    });
    nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && nav?.classList.contains('open')) {
            event.preventDefault();
            closeMenu();
            menu?.focus();
        }
    });

    const cards = [...document.querySelectorAll('[data-service]')];
    const search = document.getElementById('service-search');
    const filters = [...document.querySelectorAll('[data-category-filter]')];
    let category = 'all';
    const normalized = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    const matches = (card, value) => normalized(card.dataset.name+' '+card.dataset.description+' '+card.dataset.category).includes(normalized(value));
    function filter() {
        let count = 0;
        cards.forEach(card => {
            const visible = (category === 'all' || category === card.dataset.category) && matches(card, search?.value || '');
            card.hidden = !visible;
            if (visible) count++;
        });
        const counter = document.getElementById('result-count');
        if (counter) counter.textContent = count+' application'+(count === 1 ? '' : 's');
        const empty = document.getElementById('search-empty');
        if (empty) empty.hidden = count !== 0;
        filters.forEach(button => {
            const active = button.dataset.categoryFilter === category;
            button.classList.toggle('active',active);
            button.setAttribute('aria-pressed', String(active));
        });
    }
    search?.addEventListener('input', filter);
    filters.forEach(button => button.addEventListener('click', () => {category=button.dataset.categoryFilter;filter();}));
    document.getElementById('clear-search')?.addEventListener('click', () => {category='all';search.value='';filter();search.focus();});

    const palette = document.getElementById('command-palette');
    const query = document.getElementById('command-search');
    const results = document.getElementById('command-results');
    let opener = null;
    function paletteResults() {
        if (!results) return;
        results.replaceChildren();
        cards.filter(card => matches(card, query.value)).forEach(card => {
            const link = document.createElement('a');
            link.href=card.href;link.target='_blank';link.rel='noopener noreferrer';
            const sourceIcon = card.querySelector('.app-icon .icon');
            if (sourceIcon) link.append(sourceIcon.cloneNode(true));
            link.append(document.createTextNode(card.dataset.name));
            const access = document.createElement('small');
            access.textContent=card.querySelector('.access-label').textContent.trim();
            link.append(access);results.append(link);
        });
        document.getElementById('command-empty').hidden=results.childElementCount>0;
    }
    function openPalette(trigger) {
        if (!palette || typeof palette.showModal !== 'function') {
            if (search) { search.scrollIntoView({block:'center'});search.focus(); }
            else location.href='/#applications';
            return;
        }
        if (palette.open) return;
        opener=trigger || document.activeElement;
        query.value='';paletteResults();palette.showModal();query.focus();
    }
    document.querySelectorAll('[data-open-search]').forEach(button=>button.addEventListener('click',()=>openPalette(button)));
    document.getElementById('close-palette')?.addEventListener('click',()=>palette.close());
    palette?.addEventListener('close',()=>opener?.focus());
    palette?.addEventListener('click',event=>{
        if (event.target !== palette) return;
        const rect=palette.getBoundingClientRect();
        if (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) palette.close();
    });
    query?.addEventListener('input',paletteResults);
    palette?.addEventListener('keydown',event=>{
        const links=[...results.querySelectorAll('a')];
        if (event.key==='ArrowDown' || event.key==='ArrowUp') {
            event.preventDefault();
            const index=links.indexOf(document.activeElement);
            const next=event.key==='ArrowDown'?index+1:index-1;
            if (next<0 || next>=links.length) query.focus(); else links[next].focus();
        }
        if (event.key==='Enter' && document.activeElement===query && links.length) {event.preventDefault();links[0].click();}
    });
    document.addEventListener('keydown',event=>{
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase()==='k') {
            event.preventDefault();openPalette();return;
        }
        const editing=event.target.closest('input,textarea,select,[contenteditable]');
        if (event.key==='/' && !editing && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            if (search) search.focus(); else openPalette();
        }
    });
});
