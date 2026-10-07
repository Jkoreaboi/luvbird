import {mark,palette as p} from '../mobile/src/brandMark.ts';
import {createRequire} from 'node:module';
const sharp=createRequire(new URL('../server/package.json',import.meta.url))('sharp');
import {mkdirSync,writeFileSync} from 'node:fs';
const dir='mobile/assets';mkdirSync('deliverables/brand',{recursive:true});
const glyph=`<path d="${mark.body}" fill="${p.ink}"/><path d="${mark.wing}" fill="${p.coral}"/><path d="${mark.beak}" fill="${p.coral}"/><circle cx="59" cy="34" r="1.7" fill="${p.white}"/><path d="${mark.envelope}" fill="${p.white}" stroke="${p.ink}" stroke-width="1.5" stroke-linejoin="round"/>`;
const svg=(content,view='0 0 80 80',w=1024,h=1024)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${view}">${content}</svg>`;
const icon=svg(`<rect width="80" height="80" fill="${p.paper}"/><circle cx="40" cy="40" r="33" fill="${p.sky}"/><g transform="translate(7 5) scale(.82)">${glyph}</g>`);
writeFileSync(`${dir}/brand-mark.svg`,svg(glyph));writeFileSync('deliverables/brand/luvbird-symbol.svg',svg(glyph));
const logo=svg(`<g transform="translate(0 -5)">${glyph}</g><text x="88" y="51" fill="${p.ink}" font-family="Arial,sans-serif" font-size="48" font-weight="700" letter-spacing="-2">Luvbird</text>`,'0 0 300 80',1200,320);
writeFileSync('deliverables/brand/luvbird-logo.svg',logo);
await sharp(Buffer.from(icon)).png().toFile(`${dir}/icon.png`);
await sharp(Buffer.from(svg(`<g transform="translate(12 10) scale(.70)">${glyph}</g>`))).png().toFile(`${dir}/adaptive.png`);
await sharp(Buffer.from(svg(glyph))).png().toFile(`${dir}/splash.png`);
await sharp(Buffer.from(icon)).resize(64,64).png().toFile(`${dir}/favicon.png`);
await sharp(Buffer.from(logo)).png().toFile('deliverables/brand/luvbird-logo.png');
const board=svg(`<rect width="1200" height="820" fill="${p.paper}"/>
<text x="65" y="66" font-family="Arial" font-size="15" letter-spacing="4" fill="${p.ink}">LUVBIRD / BRAND IDENTITY</text>
<g transform="translate(80 110) scale(1.5)">${logo.replace(/<svg[^>]*>|<\/svg>/g,'')}</g>
<text x="82" y="298" font-family="Arial" font-size="26" fill="${p.ink}">A little closer, one letter at a time.</text>
<text x="82" y="345" font-family="Arial" font-size="17" fill="${p.ink}">DearBird by Luvbird · A photo and a letter, traveling for 24 hours.</text>
<g transform="translate(895 135) scale(2.4)">${icon.replace(/<svg[^>]*>|<\/svg>/g,'')}</g>
${Object.entries(p).map(([name,color],i)=>`<rect x="${82+i*216}" y="460" width="185" height="130" rx="18" fill="${color}" stroke="#ccd4cd"/><text x="${82+i*216}" y="630" font-family="Arial" font-size="16" fill="${p.ink}">${name.toUpperCase()} / ${color}</text>`).join('')}
<text x="82" y="726" font-family="Arial" font-size="20" fill="${p.ink}">A bird for the journey. A heart for the story. A letter for you.</text>
<text x="82" y="765" font-family="Arial" font-size="14" fill="${p.ink}">Original vector artwork · Editable SVG · App icon, splash and in-app symbol</text>`,'0 0 1200 820',1200,820);
await sharp(Buffer.from(board)).png().toFile('deliverables/luvbird-brand.png');
