// Run after export-brand.py; dependencies are development-only, never shipped to browsers.
const fs=require('node:fs/promises');
const path=require('node:path');
const sharp=require('sharp');
const {PDFDocument,rgb}=require('pdf-lib');
const JSZip=require('jszip');
const root=path.resolve(__dirname,'../assets/brand');
(async()=>{
 for(const variant of ['on-dark','on-light','mono']) {
  const name='ap-'+variant,svg=await fs.readFile(path.join(root,name+'.svg'));
  const png=await sharp(svg).resize(1024,1024).png().toBuffer();
  await fs.writeFile(path.join(root,name+'.png'),png);
  await sharp(svg).resize(1024,1024).webp({lossless:true}).toFile(path.join(root,name+'.webp'));
  await sharp(png).flatten({background:variant==='on-dark'?'#111317':'#ffffff'}).jpeg({quality:95}).toFile(path.join(root,name+'.jpg'));
  const pdf=await PDFDocument.create(),page=pdf.addPage([512,512]);
  for(const match of svg.toString().matchAll(/<path fill="(#\w+)" d="([^"]+)"/g)) {
   const hex=match[1].slice(1),c=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255);
   page.drawSvgPath(match[2],{x:0,y:512,color:rgb(...c)});
  }
  await fs.writeFile(path.join(root,name+'.pdf'),await pdf.save());
 }
 const sizes=[16,32,48,64,128,256],images=[];
 for(const size of sizes) images.push(await sharp(path.join(root,'ap-on-light.svg')).resize(size,size).png().toBuffer());
 const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
 let offset=header.length;
 images.forEach((buf,i)=>{const n=6+16*i;header[n]=header[n+1]=sizes[i]===256?0:sizes[i];header.writeUInt16LE(1,n+4);header.writeUInt16LE(32,n+6);header.writeUInt32LE(buf.length,n+8);header.writeUInt32LE(offset,n+12);offset+=buf.length;});
 await fs.writeFile(path.join(root,'ap.ico'),Buffer.concat([header,...images]));
 const zip=new JSZip();
 for(const file of await fs.readdir(root)) if(file!=='ap-brand-kit.zip') zip.file(file,await fs.readFile(path.join(root,file)));
 await fs.writeFile(path.join(root,'ap-brand-kit.zip'),await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
 console.log('Exported outlined SVG/PDF, 1024px PNG/WebP/JPEG, multi-size ICO and brand ZIP.');
})().catch(error=>{console.error(error);process.exitCode=1;});
