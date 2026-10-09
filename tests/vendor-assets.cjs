// Development-only extraction of a small Lucide sprite from the installed package.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const packageRoot = process.env.LUCIDE_ROOT;
if (!packageRoot) throw new Error('Set LUCIDE_ROOT to a reviewed Lucide package');
const lucide = require(packageRoot);
const names = ['ArrowUpRight','ArrowRight','Search','X','Menu','Sun','Moon','Laptop','Command','ScanLine','Image','Camera','Gamepad2','FlaskConical','Link','House','Network','Container','FolderOpen','Share2','Wrench','FileText','ArrowLeftRight','Rss','Clipboard','ChartNoAxesCombined','Wifi','MousePointer2','Globe','ShieldCheck','Mail','ExternalLink','ChevronDown','RefreshCw','Compass','Download'];
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const symbols = names.map(name => {
  const nodes = lucide[name];
  if (!Array.isArray(nodes)) throw new Error('Missing Lucide icon: '+name);
  const id = name.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
  return `<symbol id="${id}" viewBox="0 0 24 24">${nodes.map(([tag,attrs])=>`<${tag} ${Object.entries(attrs).filter(([key])=>key!=='key').map(([key,value])=>`${key}="${escape(value)}"`).join(' ')}/>`).join('')}</symbol>`;
});
fs.writeFileSync(path.join(root,'assets/icons.svg'), `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`);
fs.copyFileSync(path.join(packageRoot,'LICENSE'),path.join(root,'assets/LUCIDE-LICENSE.txt'));
console.log('Extracted '+names.length+' Lucide icons');
