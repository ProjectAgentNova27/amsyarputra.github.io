/* AP. QR — deterministic, lossless on-device segmentation. */
export const MAX_QR_CHARACTERS = 800;
export function countCharacters(text) { return Array.from(text).length; }
function lastMatchCut(prefix, regex) {
 let match, last=0;
 while ((match = regex.exec(prefix)) !== null) {
   const end=match.index + match[0].length;
   if(end < prefix.length) last=end;
 }
 return last ? countCharacters(prefix.slice(0,last)) : 0;
}
function findBoundary(prefix) {
 const paragraph=lastMatchCut(prefix,/(?:\r\n|\n|\r)(?:[ \t]*(?:\r\n|\n|\r))+/g);
 if(paragraph) return paragraph;
 const sentence=lastMatchCut(prefix,/[.!?][\u201d\u2019"')\]]*(?:[ \t\r\n]+|$)/g);
 if(sentence) return sentence;
 const word=lastMatchCut(prefix,/[ \t\r\n]+/g);
 if(word) return word;
 return countCharacters(prefix);
}
export function splitText(original,max=MAX_QR_CHARACTERS) {
 if(typeof original!=='string' || !original.length) throw new Error('Paste some text first.');
 if(!Number.isSafeInteger(max) || max<1 || max>MAX_QR_CHARACTERS) throw new Error('Invalid QR limit.');
 const points=Array.from(original), chunks=[];
 for(let offset=0;offset<points.length;) {
   const remaining=points.length-offset, width=Math.min(max,remaining);
   const prefix=points.slice(offset,offset+width).join('');
   let take=remaining>max?findBoundary(prefix):width;
   if(!take || take>max) take=width;
   const value=points.slice(offset,offset+take).join('');
   if(!value || countCharacters(value)>max) throw new Error('Failed to validate a QR chunk.');
   chunks.push(value);offset+=take;
 }
 if(chunks.join('')!==original) throw new Error('Text reconstruction failed. Nothing generated.');
 return chunks;
}
export function splitOversizedEncoding(chunk) {
 const length=countCharacters(chunk);
 if(length<=1) throw new Error('Unable to encode even one character.');
 const part1=splitText(chunk,Math.floor(length/2))[0];
 const part2=chunk.slice(part1.length);
 if(!part2 || part1+part2!==chunk) throw new Error('QR reduction failed.');
 return [part1,part2];
}