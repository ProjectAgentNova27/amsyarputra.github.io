document.addEventListener('DOMContentLoaded', () => {
    const refresh=document.getElementById('refresh-status');
    const counts={online:document.getElementById('services-online'),protected:document.getElementById('services-protected'),offline:document.getElementById('services-offline'),unknown:document.getElementById('services-unknown')};
    function setOverall(state,text) {
        const pill=document.getElementById('overall-status');
        pill.className='status-pill '+state;pill.textContent=text;
    }
    document.addEventListener('portal:status',event=>{
        const {data,services,error}=event.detail;
        const states=new Map(services.filter(s=>KNOWN_STATUS_KEYS.includes(s.key)).map(s=>[s.key,normaliseStatus(s.status)[0]]));
        const totals={online:0,protected:0,offline:0,unknown:0};
        KNOWN_STATUS_KEYS.forEach(key=>totals[states.get(key) || 'unknown']++);
        Object.entries(counts).forEach(([state,element])=>{if(element)element.textContent=String(totals[state]);});
        const reachable=totals.online+totals.protected;
        const summary=`${reachable} of ${KNOWN_STATUS_KEYS.length} reachable`;
        if (error || totals.unknown===KNOWN_STATUS_KEYS.length) setOverall('unknown','Unknown');
        else if (totals.offline) setOverall('offline',`Degraded · ${summary}`);
        else if (totals.unknown) setOverall('pending',`${summary} · ${totals.unknown} unverified`);
        else setOverall('online',summary);
        const checked=document.getElementById('last-checked');
        const timestamp=data?.checked_at || data?.checkedAt;
        const date=timestamp?new Date(timestamp):null;
        checked.textContent=error?'Status unavailable':date && !Number.isNaN(date.getTime())?new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(date):'Unknown';
        document.getElementById('status-error').hidden=!error;
        refresh.disabled=false;
    });
    refresh?.addEventListener('click',()=>{
        refresh.disabled=true;
        setOverall('pending','Checking');
        refreshPortalStatus();
    });
});
