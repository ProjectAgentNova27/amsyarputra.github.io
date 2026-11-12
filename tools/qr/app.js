import {MAX_QR_CHARACTERS,countCharacters,splitText,splitOversizedEncoding} from './splitter.js';
const el=id=>document.getElementById(id);
const ui={input:el('input-text'),count:el('input-count'),estimate:el('estimated-count'),generate:el('generate'),paste:el('paste'),clear:el('clear'),results:el('results'),summary:el('result-summary'),list:el('qr-list'),saveAll:el('save-all'),shareAll:el('share-all'),notice:el('notice'),offline:el('offline-status')};
let generated=[],busy=false;
function message(text,error=false){ui.notice.textContent=text;ui.notice.classList.remove('hidden');ui.notice.classList.toggle('error',error);}
function hideMessage(){ui.notice.classList.add('hidden');ui.notice.textContent='';}
function updateCount(){const value=ui.input.value,n=countCharacters(value);ui.count.textContent=n.toLocaleString()+(n===1?' character':' characters');const count=n?splitText(value).length:0;ui.estimate.textContent=count+' expected QR code'+(count===1?'':'s');}
function clearResults(){generated.forEach(item=>URL.revokeObjectURL(item.url));generated=[];ui.list.replaceChildren();ui.results.classList.add('hidden');}
function setBusy(state){busy=state;for(const button of [ui.generate,ui.clear,ui.paste,ui.shareAll,ui.saveAll])button.disabled=state;ui.generate.textContent=state?'Generating locally…':'Generate QR codes';}
function qrSvg(text){if(typeof window.QRCode!=='function')throw new Error('QR library unavailable. Reopen this page online to complete installation.');return window.QRCode({msg:text,dim:640,pad:4,ecl:'M',ecb:0,pal:['#000000','#ffffff']});}
function buildChunks(original){
 const pending=splitText(original),output=[];
 let count=0;
 while(pending.length){
  if(++count>1000)throw new Error('Too many QR chunks. Please shorten the text.');
  const text=pending.shift();
  if(!text||countCharacters(text)>MAX_QR_CHARACTERS)throw new Error('Invalid QR chunk length.');
  try{qrSvg(text);output.push(text);}
  catch(err){if(!(err instanceof RangeError)||!/too long/i.test(String(err.message)))throw err;const pieces=splitOversizedEncoding(text);pending.unshift(...pieces);}
 }
 if(output.join('')!==original)throw new Error('Text integrity check failed; no QR codes generated.');
 return output;
}
async function pngFromSvg(svg){
 const source='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));
 try{
  const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Unable to render QR image.'));img.src=source;});
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas not supported.');
  ctx.imageSmoothingEnabled=false;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1024,1024);ctx.drawImage(image,0,0,1024,1024);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob||!blob.size)throw new Error('PNG export failed.');return blob;
 }finally{/* data SVG image — no object URL to revoke */}
}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('Could not display the generated PNG.'));r.readAsDataURL(blob);});}
function fileName(i,n){const width=Math.max(2,String(n).length);return 'AP_QR_'+String(i+1).padStart(width,'0')+'_of_'+n+'.png';}
function saveBlob(blob,name){const href=URL.createObjectURL(blob),link=document.createElement('a');link.download=name;link.href=href;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(href),20000);}
function render(){
 const fragment=document.createDocumentFragment();
 generated.forEach((item,i)=>{
  const card=document.createElement('article');card.className='qr-card';const heading=document.createElement('h3');heading.textContent='QR '+(i+1)+' of '+generated.length;
  const count=document.createElement('p');count.className='meta';count.textContent=countCharacters(item.text)+' / 800 characters';
  const wrap=document.createElement('div');wrap.className='qr-image-wrap';const picture=document.createElement('img');picture.src=item.url;picture.alt='QR code '+(i+1)+' of '+generated.length;picture.width=320;picture.height=320;wrap.append(picture);
  const actions=document.createElement('div');actions.className='actions';
  for(const [action,label] of [['save','Save PNG'],['share','Share'],['copy','Copy text']]){
   const button=document.createElement('button');button.type='button';button.className='btn secondary';button.dataset.action=action;button.dataset.index=String(i);button.textContent=label;actions.append(button);
  }
  card.append(heading,count,wrap,actions);fragment.append(card);
 });
 ui.list.replaceChildren(fragment);const n=countCharacters(generated.map(item=>item.text).join(''));ui.summary.textContent=n.toLocaleString()+' characters across '+generated.length+' verified QR code'+(generated.length===1?'':'s')+'.';ui.results.classList.remove('hidden');
}
async function generate(){
 if(busy)return;clearResults();hideMessage();
 const text=ui.input.value;if(!text){message('Paste or type some text first.',true);return;}
 if(countCharacters(text)>100000){message('Input exceeds the 100,000-character safety limit.',true);return;}
 setBusy(true);const staged=[];
 try{
  const chunks=buildChunks(text);
  for(const chunk of chunks){
   await new Promise(resolve=>requestAnimationFrame(resolve));
   const blob=await pngFromSvg(qrSvg(chunk));
   staged.push({text:chunk,blob,url:await blobToDataUrl(blob)});
  }
  if(staged.map(x=>x.text).join('')!==text||staged.some(x=>countCharacters(x.text)>MAX_QR_CHARACTERS))throw new Error('Final text verification failed.');
  generated=staged;render();message('Generated '+generated.length+' QR code'+(generated.length===1?'':'s')+' locally. No text was uploaded.');
 }catch(err){staged.forEach(x=>URL.revokeObjectURL(x.url));ui.results.classList.add('hidden');message(err instanceof Error?err.message:'Generation failed.',true);}finally{setBusy(false);}
}
const utf8=new TextEncoder();
function u16(n){return [n&255,(n>>>8)&255];}
function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];}
const crcTable=new Uint32Array(256);
for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);crcTable[i]=c>>>0;}
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return(crc^0xffffffff)>>>0;}
async function zipFiles(items){
 const parts=[],directory=[];let offset=0;
 for(let i=0;i<items.length;i++){
  const data=new Uint8Array(await items[i].blob.arrayBuffer()),name=utf8.encode(fileName(i,items.length)),crc=crc32(data);
  const local=new Uint8Array([80,75,3,4,...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...name]);
  parts.push(local,data);
  const central=new Uint8Array([80,75,1,2,...u16(20),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...name]);
  directory.push(central);offset+=local.length+data.length;
 }
 const dirLength=directory.reduce((sum,part)=>sum+part.length,0),footer=new Uint8Array([80,75,5,6,...u16(0),...u16(0),...u16(items.length),...u16(items.length),...u32(dirLength),...u32(offset),...u16(0)]);
 return new Blob([...parts,...directory,footer],{type:'application/zip'});
}
function makeFiles(items,firstIndex=0){return items.map((item,i)=>new File([item.blob],fileName(i+firstIndex,generated.length),{type:'image/png'}));}
async function shareImages(items,firstIndex=0){
 const files=makeFiles(items,firstIndex);
 if(navigator.share&&(!navigator.canShare||navigator.canShare({files}))){await navigator.share({files,title:'AP. QR codes'});return true;}
 return false;
}
ui.input.addEventListener('input',()=>{updateCount();hideMessage();if(generated.length)clearResults();});
ui.generate.addEventListener('click',generate);
ui.clear.addEventListener('click',()=>{if(busy)return;ui.input.value='';clearResults();hideMessage();updateCount();ui.input.focus();});
ui.paste.addEventListener('click',async()=>{
 try{if(!navigator.clipboard?.readText)throw new Error('Clipboard reading unavailable. Long-press the text field to paste.');const value=await navigator.clipboard.readText();if(!value)throw new Error('Clipboard has no text.');ui.input.value=value;clearResults();hideMessage();updateCount();}
 catch(err){message(err.message||'Paste manually into the text field.',true);}
});
ui.list.addEventListener('click',async event=>{
 const button=event.target.closest('button[data-action]');if(!button||busy)return;
 const index=Number(button.dataset.index),item=generated[index];if(!item)return;
 try{
  if(button.dataset.action==='save')saveBlob(item.blob,fileName(index,generated.length));
  if(button.dataset.action==='share'){
   if(!(await shareImages([item],index))){saveBlob(item.blob,fileName(index,generated.length));message('Sharing is unavailable; the image was saved instead.');}
  }
  if(button.dataset.action==='copy'){if(!navigator.clipboard?.writeText)throw new Error('Clipboard copy is unavailable.');await navigator.clipboard.writeText(item.text);message('Copied text for QR '+(index+1)+'.');}
 }catch(err){if(err.name!=='AbortError')message(err.message||'Action failed.',true);}
});
ui.saveAll.addEventListener('click',async()=>{if(!generated.length||busy)return;try{saveBlob(await zipFiles(generated),'AP_QR_Codes.zip');}catch(err){message(err.message||'ZIP creation failed.',true);}});
ui.shareAll.addEventListener('click',async()=>{
 if(!generated.length||busy)return;
 try{
  if(await shareImages(generated))return;
  const zip=await zipFiles(generated),file=new File([zip],'AP_QR_Codes.zip',{type:'application/zip'});
  if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]})))await navigator.share({files:[file],title:'AP. QR codes'});
  else{saveBlob(zip,'AP_QR_Codes.zip');message('Share not available; downloaded the ZIP instead.');}
 }catch(err){if(err.name!=='AbortError')message(err.message||'Sharing failed.',true);}
});
async function enableOffline(){
 if(!('serviceWorker' in navigator)){ui.offline.textContent='Online only';ui.offline.className='status-tag warning';return;}
 try{
  const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});await navigator.serviceWorker.ready;
  if(!registration.active)throw new Error('Worker unavailable');
  const cache=await caches.open('ap-qr-static-v1');
  const checks=await Promise.all(['./index.html','./app.js','./vendor/qrcode.light.min.js'].map(url=>cache.match(url)));
  if(checks.some(x=>!x))throw new Error('Offline cache incomplete');
  ui.offline.textContent='Offline ready';ui.offline.className='status-tag';
 }catch(_){ui.offline.textContent='Offline not ready';ui.offline.className='status-tag warning';}
}
ui.input.value='';updateCount();enableOffline();
