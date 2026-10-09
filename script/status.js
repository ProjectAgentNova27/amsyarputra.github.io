const STATUS_ENDPOINT = 'https://status-api.amsyarputra.net/status.json';
const KNOWN_STATUS_KEYS = ['website','docs','home','dns','docker','files','drop','shlink','short','tools','pdf','emu','booth','photo','lab','convert','news','paste','beszel','router','sunshine','actions'];
function normaliseStatus(value) {
    const status=String(value || '').toLowerCase();
    if (status==='online' || status==='ok') return ['online','Online'];
    if (status==='protected') return ['protected','Protected'];
    if (status==='offline') return ['offline','Offline'];
    return ['unknown','Unknown'];
}
function extractServices(data) {
    if (!data || typeof data!=='object') return [];
    if (Array.isArray(data.services)) return data.services.filter(service=>service && typeof service==='object');
    return Object.entries(data).filter(([key,value])=>KNOWN_STATUS_KEYS.includes(key) && value && typeof value==='object').map(([key,value])=>({...value,key}));
}
function setStatus(key,state,text) {
    if (!KNOWN_STATUS_KEYS.includes(key)) return;
    document.querySelectorAll('[data-status-key="'+key+'"]').forEach(pill=>{
        pill.textContent=text;
        pill.classList.remove('pending','online','offline','unknown','protected');
        pill.classList.add(state);
    });
}
async function refreshPortalStatus() {
    KNOWN_STATUS_KEYS.forEach(key=>setStatus(key,'pending','Checking'));
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8000);
    let data=null,services=[],error=false;
    try {
        const response=await fetch(STATUS_ENDPOINT,{cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
        if (!response.ok) {await response.body?.cancel();throw new Error('Status unavailable');}
        data=await response.json();
        services=extractServices(data);
        if (!services.length) throw new Error('Empty status response');
        KNOWN_STATUS_KEYS.forEach(key=>setStatus(key,'unknown','Unknown'));
        services.forEach(service=>{const [state,text]=normaliseStatus(service.status);setStatus(service.key,state,text);});
    } catch (_) {
        error=true;
        KNOWN_STATUS_KEYS.forEach(key=>setStatus(key,'unknown','Unknown'));
    } finally {clearTimeout(timeout);}
    document.dispatchEvent(new CustomEvent('portal:status',{detail:{data,services,error}}));
    return {data,services,error};
}
document.addEventListener('DOMContentLoaded',()=>{
    if (document.querySelector('[data-status-key]')) refreshPortalStatus();
});
